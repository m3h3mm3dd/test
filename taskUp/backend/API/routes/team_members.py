from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from Db.session import get_db
from API.utils.dependencies import get_current_active_user
from API.Models.User import User
from API.schemas.team_member import TeamMemberCreate, TeamMemberUpdate, TeamMemberResponse
from API.services.team_service import (
    get_team_by_id, add_member_to_team, update_team_member, remove_member_from_team
)

router = APIRouter(
    prefix="/teams/{team_id}/members",
    tags=["team members"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[TeamMemberResponse])
def read_team_members(
    team_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all members for a team"""
    # Check if team exists
    team = get_team_by_id(db, team_id)
    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Return active members for the team
    active_members = [member for member in team.TeamMemberships if member.IsActive]
    return active_members

@router.post("/", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
def add_member(
    team_id: str,
    member: TeamMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a member to a team"""
    # Check if team exists
    team = get_team_by_id(db, team_id)
    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user is team creator or leader
    is_leader = any(
        member.UserId == current_user.Id and member.IsLeader and member.IsActive
        for member in team.TeamMemberships
    )
    
    if team.CreatedBy != current_user.Id and not is_leader and current_user.Role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add members to this team"
        )
    
    # Ensure the TeamId in the path matches the one in the request body
    if member.TeamId != team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team ID in path does not match Team ID in request body"
        )
    
    # Add member to team
    return add_member_to_team(db, member)

@router.put("/{user_id}", response_model=TeamMemberResponse)
def update_member(
    team_id: str,
    user_id: str,
    member_update: TeamMemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a team member's details"""
    # Check if team exists
    team = get_team_by_id(db, team_id)
    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user is team creator or leader
    is_leader = any(
        member.UserId == current_user.Id and member.IsLeader and member.IsActive
        for member in team.TeamMemberships
    )
    
    if team.CreatedBy != current_user.Id and not is_leader and current_user.Role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update members in this team"
        )
    
    # Update team member
    updated_member = update_team_member(db, team_id, user_id, member_update)
    if not updated_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    return updated_member

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    team_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove a member from a team"""
    # Check if team exists
    team = get_team_by_id(db, team_id)
    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user is team creator or leader
    is_leader = any(
        member.UserId == current_user.Id and member.IsLeader and member.IsActive
        for member in team.TeamMemberships
    )
    
    if team.CreatedBy != current_user.Id and not is_leader and current_user.Role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to remove members from this team"
        )
    
    # Prevent removing yourself if you're the last leader
    if user_id == current_user.Id:
        is_only_leader = all(
            (member.UserId == current_user.Id or not member.IsLeader) and member.IsActive
            for member in team.TeamMemberships
        )
        
        if is_only_leader:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove yourself as the only team leader. Assign another member as leader first."
            )
    
    # Remove member from team
    success = remove_member_from_team(db, team_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    return None