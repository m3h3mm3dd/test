from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
import uuid
from datetime import datetime

from API.Models.Team import Team
from API.Models.TeamMember import TeamMember
from API.Models.User import User
from API.Models.TeamProject import TeamProject
from API.Models.Project import Project
from API.schemas.team import TeamCreate, TeamUpdate
from API.schemas.team_member import TeamMemberCreate, TeamMemberUpdate

# Team functions
def get_team_by_id(db: Session, team_id: str) -> Optional[Team]:
    """Get a team by ID"""
    return db.query(Team).filter(Team.Id == team_id, Team.IsDeleted == False).first()

def get_teams(
    db: Session, 
    user_id: str, 
    skip: int = 0, 
    limit: int = 100
) -> List[Team]:
    """Get teams the user is a member of"""
    query = db.query(Team).filter(Team.IsDeleted == False)
    
    # Filter by teams the user is a member of or created
    query = query.filter(
        (Team.CreatedBy == user_id) | 
        (Team.Id.in_(
            db.query(TeamMember.TeamId).filter(TeamMember.UserId == user_id, TeamMember.IsActive == True)
        ))
    )
    
    return query.order_by(Team.CreatedAt.desc()).offset(skip).limit(limit).all()

def count_teams(
    db: Session, 
    user_id: str
) -> int:
    """Count teams the user is a member of"""
    query = db.query(Team).filter(Team.IsDeleted == False)
    
    # Filter by teams the user is a member of or created
    query = query.filter(
        (Team.CreatedBy == user_id) | 
        (Team.Id.in_(
            db.query(TeamMember.TeamId).filter(TeamMember.UserId == user_id, TeamMember.IsActive == True)
        ))
    )
    
    return query.count()

def create_team(db: Session, team: TeamCreate, user_id: str) -> Team:
    """Create a new team"""
    team_id = str(uuid.uuid4())
    
    # Create the team
    db_team = Team(
        Id=team_id,
        Name=team.Name,
        Description=team.Description,
        ColorIndex=team.ColorIndex or 0,
        CreatedBy=user_id
    )
    
    db.add(db_team)
    
    # Add the creator as a team member and leader
    db_team_member = TeamMember(
        Id=str(uuid.uuid4()),
        TeamId=team_id,
        UserId=user_id,
        Role="Team Lead",
        IsLeader=True,
        JoinedDate=datetime.utcnow(),
        IsActive=True
    )
    
    db.add(db_team_member)
    db.commit()
    db.refresh(db_team)
    
    return db_team

def update_team(db: Session, team_id: str, team_update: TeamUpdate) -> Optional[Team]:
    """Update team details"""
    db_team = get_team_by_id(db, team_id)
    if not db_team:
        return None
    
    # Update fields if they are provided
    update_data = team_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_team, key, value)
    
    db.commit()
    db.refresh(db_team)
    
    return db_team

def delete_team(db: Session, team_id: str) -> bool:
    """Soft delete a team"""
    db_team = get_team_by_id(db, team_id)
    if not db_team:
        return False
    
    db_team.IsDeleted = True
    db.commit()
    
    return True

# Team member functions
def add_member_to_team(db: Session, team_member: TeamMemberCreate) -> TeamMember:
    """Add a member to a team"""
    # Check if team exists
    db_team = get_team_by_id(db, team_member.TeamId)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user exists
    db_user = db.query(User).filter(User.Id == team_member.UserId, User.IsDeleted == False).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is already a member of the team
    existing_member = db.query(TeamMember).filter(
        TeamMember.TeamId == team_member.TeamId,
        TeamMember.UserId == team_member.UserId,
        TeamMember.IsActive == True
    ).first()
    
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this team"
        )
    
    # If user is marked as leader, ensure no other member is leader
    if team_member.IsLeader:
        current_leader = db.query(TeamMember).filter(
            TeamMember.TeamId == team_member.TeamId,
            TeamMember.IsLeader == True,
            TeamMember.IsActive == True
        ).first()
        
        if current_leader:
            current_leader.IsLeader = False
    
    # Create team member
    db_team_member = TeamMember(
        Id=str(uuid.uuid4()),
        TeamId=team_member.TeamId,
        UserId=team_member.UserId,
        Role=team_member.Role,
        IsLeader=team_member.IsLeader,
        JoinedDate=datetime.utcnow(),
        IsActive=True
    )
    
    db.add(db_team_member)
    db.commit()
    db.refresh(db_team_member)
    
    return db_team_member

def update_team_member(db: Session, team_id: str, user_id: str, member_update: TeamMemberUpdate) -> Optional[TeamMember]:
    """Update a team member's details"""
    # Find the team member
    db_team_member = db.query(TeamMember).filter(
        TeamMember.TeamId == team_id,
        TeamMember.UserId == user_id,
        TeamMember.IsActive == True
    ).first()
    
    if not db_team_member:
        return None
    
    # Update fields if they are provided
    update_data = member_update.dict(exclude_unset=True)
    
    # If changing to leader, ensure no other member is leader
    if "IsLeader" in update_data and update_data["IsLeader"]:
        current_leader = db.query(TeamMember).filter(
            TeamMember.TeamId == team_id,
            TeamMember.IsLeader == True,
            TeamMember.IsActive == True,
            TeamMember.UserId != user_id
        ).first()
        
        if current_leader:
            current_leader.IsLeader = False
    
    for key, value in update_data.items():
        setattr(db_team_member, key, value)
    
    db.commit()
    db.refresh(db_team_member)
    
    return db_team_member

def remove_member_from_team(db: Session, team_id: str, user_id: str) -> bool:
    """Remove a member from a team"""
    # Find the team member
    db_team_member = db.query(TeamMember).filter(
        TeamMember.TeamId == team_id,
        TeamMember.UserId == user_id,
        TeamMember.IsActive == True
    ).first()
    
    if not db_team_member:
        return False
    
    # Don't allow removing the last member
    team_member_count = db.query(TeamMember).filter(
        TeamMember.TeamId == team_id,
        TeamMember.IsActive == True
    ).count()
    
    if team_member_count <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the last member of a team"
        )
    
    # If removing a leader, make sure there's another member to be leader
    if db_team_member.IsLeader:
        other_member = db.query(TeamMember).filter(
            TeamMember.TeamId == team_id,
            TeamMember.UserId != user_id,
            TeamMember.IsActive == True
        ).first()
        
        if other_member:
            other_member.IsLeader = True
    
    # Soft delete by setting IsActive to False
    db_team_member.IsActive = False
    db.commit()
    
    return True

# Team project functions
def add_project_to_team(db: Session, team_id: str, project_id: str) -> TeamProject:
    """Add a project to a team"""
    # Check if team exists
    db_team = get_team_by_id(db, team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if project exists
    db_project = db.query(Project).filter(Project.Id == project_id, Project.IsDeleted == False).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if team is already assigned to this project
    existing_assignment = db.query(TeamProject).filter(
        TeamProject.TeamId == team_id,
        TeamProject.ProjectId == project_id
    ).first()
    
    if existing_assignment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team is already assigned to this project"
        )
    
    # Create team-project assignment
    db_team_project = TeamProject(
        Id=str(uuid.uuid4()),
        TeamId=team_id,
        ProjectId=project_id,
        CreatedAt=datetime.utcnow()
    )
    
    db.add(db_team_project)
    db.commit()
    db.refresh(db_team_project)
    
    return db_team_project

def remove_project_from_team(db: Session, team_id: str, project_id: str) -> bool:
    """Remove a project from a team"""
    # Find the team-project assignment
    db_team_project = db.query(TeamProject).filter(
        TeamProject.TeamId == team_id,
        TeamProject.ProjectId == project_id
    ).first()
    
    if not db_team_project:
        return False
    
    db.delete(db_team_project)
    db.commit()
    
    return True