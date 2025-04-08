from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from Db.session import get_db
from API.utils.dependencies import get_current_active_user
from API.Models.User import User
from API.Models.Project import Project
from API.services.team_service import (
    get_team_by_id, add_project_to_team, remove_project_from_team
)

router = APIRouter(
    prefix="/teams/{team_id}/projects",
    tags=["team projects"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
def read_team_projects(
    team_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all projects for a team"""
    # Check if team exists
    team = get_team_by_id(db, team_id)
    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Return projects for the team
    return team.Projects

@router.post("/{project_id}", status_code=status.HTTP_201_CREATED)
def add_project(
    team_id: str,
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a project to a team"""
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
            detail="Not authorized to add projects to this team"
        )
    
    # Check if project exists
    project = db.query(Project).filter(Project.Id == project_id, Project.IsDeleted == False).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Add project to team
    team_project = add_project_to_team(db, team_id, project_id)
    
    return {"message": "Project added to team successfully"}

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project(
    team_id: str,
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove a project from a team"""
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
            detail="Not authorized to remove projects from this team"
        )
    
    # Check if project exists in this team
    project_exists = any(p.Id == project_id for p in team.Projects)
    if not project_exists:
        raise HTTPException(status_code=404, detail="Project not found in this team")
    
    # Remove project from team
    success = remove_project_from_team(db, team_id, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found in this team")
    
    return None