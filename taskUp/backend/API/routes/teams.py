from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from Db.session import get_db
from API.utils.dependencies import get_current_active_user
from API.Models.User import User
from API.schemas.team import TeamCreate, TeamUpdate, TeamResponse, TeamDetailResponse, TeamListResponse
from API.services.team_service import (
    get_team_by_id, get_teams, count_teams, create_team, update_team, delete_team
)

router = APIRouter(
    prefix="/teams",
    tags=["teams"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_new_team(
    team: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new team"""
    return create_team(db, team, current_user.Id)

@router.get("/", response_model=TeamListResponse)
def read_teams(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of teams the user is a member of"""
    teams = get_teams(db, current_user.Id, skip=skip, limit=limit)
    total = count_teams(db, current_user.Id)
    return {"items": teams, "total": total}

@router.get("/{team_id}", response_model=TeamDetailResponse)
def read_team(
    team_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get team details by ID"""
    db_team = get_team_by_id(db, team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_team

@router.put("/{team_id}", response_model=TeamResponse)
def update_team_details(
    team_id: str,
    team_update: TeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update team details"""
    # Check if team exists
    db_team = get_team_by_id(db, team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user is team creator or leader
    is_leader = any(
        member.UserId == current_user.Id and member.IsLeader and member.IsActive
        for member in db_team.TeamMemberships
    )
    
    if db_team.CreatedBy != current_user.Id and not is_leader and current_user.Role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this team"
        )
    
    # Update team
    updated_team = update_team(db, team_id, team_update)
    return updated_team

@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team_by_id(
    team_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a team"""
    # Check if team exists
    db_team = get_team_by_id(db, team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Only creator or admin can delete team
    if db_team.CreatedBy != current_user.Id and current_user.Role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this team"
        )
    
    success = delete_team(db, team_id)
    if not success:
        raise HTTPException(status_code=404, detail="Team not found")
    
    return None