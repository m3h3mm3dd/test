from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
import uuid
from datetime import datetime

from API.Models.Project import Project
from API.Models.User import User
from API.Models.ProjectScope import ProjectScope
from API.Models.ProjectStakeholder import ProjectStakeholder
from API.schemas.project import ProjectCreate, ProjectUpdate
from API.schemas.project_scope import ProjectScopeCreate, ProjectScopeUpdate
from API.schemas.project_stakeholder import ProjectStakeholderCreate, ProjectStakeholderUpdate

# Project functions
def get_project_by_id(db: Session, project_id: str) -> Optional[Project]:
    """Get a project by ID"""
    return db.query(Project).filter(Project.Id == project_id, Project.IsDeleted == False).first()

def get_projects(
    db: Session, 
    user_id: str, 
    skip: int = 0, 
    limit: int = 100,
    status: Optional[str] = None
) -> List[Project]:
    """Get a list of projects the user has access to"""
    query = db.query(Project).filter(Project.IsDeleted == False)
    
    # Filter by status if provided
    if status:
        query = query.filter(Project.Status == status)
    
    # Filter by user (either creator or member/stakeholder)
    query = query.filter(
        (Project.CreatedBy == user_id) |
        (Project.Id.in_(
            db.query(ProjectStakeholder.ProjectId).filter(ProjectStakeholder.UserId == user_id)
        ))
    )
    
    return query.order_by(Project.CreatedAt.desc()).offset(skip).limit(limit).all()

def count_projects(
    db: Session, 
    user_id: str,
    status: Optional[str] = None
) -> int:
    """Count projects the user has access to"""
    query = db.query(Project).filter(Project.IsDeleted == False)
    
    # Filter by status if provided
    if status:
        query = query.filter(Project.Status == status)
    
    # Filter by user (either creator or member/stakeholder)
    query = query.filter(
        (Project.CreatedBy == user_id) |
        (Project.Id.in_(
            db.query(ProjectStakeholder.ProjectId).filter(ProjectStakeholder.UserId == user_id)
        ))
    )
    
    return query.count()

def create_project(db: Session, project: ProjectCreate, user_id: str) -> Project:
    """Create a new project"""
    project_id = str(uuid.uuid4())
    
    # Create the project
    db_project = Project(
        Id=project_id,
        Name=project.Name,
        Description=project.Description,
        TotalBudget=project.TotalBudget,
        RemainingBudget=project.TotalBudget,
        Status=Project.STATUS_NOT_STARTED,
        CreatedBy=user_id
    )
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    return db_project

def update_project(db: Session, project_id: str, project_update: ProjectUpdate) -> Optional[Project]:
    """Update project details"""
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        return None
    
    # Update fields if they are provided
    update_data = project_update.dict(exclude_unset=True)
    
    # Special handling for TotalBudget to update RemainingBudget
    if "TotalBudget" in update_data:
        new_budget = update_data["TotalBudget"]
        # Calculate the difference to adjust RemainingBudget
        budget_diff = float(new_budget) - float(db_project.TotalBudget or 0)
        db_project.RemainingBudget = float(db_project.RemainingBudget or 0) + budget_diff
    
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    
    return db_project

def delete_project(db: Session, project_id: str) -> bool:
    """Soft delete a project"""
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        return False
    
    db_project.IsDeleted = True
    db.commit()
    
    return True

def update_project_progress(db: Session, project_id: str) -> Optional[Project]:
    """Update project progress based on completed tasks"""
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        return None
    
    # Count total and completed tasks
    total_tasks = len(db_project.Tasks)
    completed_tasks = sum(1 for task in db_project.Tasks if task.Completed)
    
    # Calculate progress percentage
    if total_tasks > 0:
        db_project.Progress = int((completed_tasks / total_tasks) * 100)
    else:
        db_project.Progress = 0
    
    # Update status based on progress
    if db_project.Progress == 100:
        db_project.Status = Project.STATUS_COMPLETED
    elif db_project.Progress > 0:
        db_project.Status = Project.STATUS_IN_PROGRESS
    
    db.commit()
    db.refresh(db_project)
    
    return db_project

# Project scope functions
def get_project_scope(db: Session, project_id: str) -> Optional[ProjectScope]:
    """Get a project's scope"""
    return db.query(ProjectScope).filter(ProjectScope.ProjectId == project_id).first()

def create_or_update_project_scope(
    db: Session, 
    project_id: str, 
    scope_data: ProjectScopeCreate if isinstance(ProjectScopeCreate, type) else ProjectScopeUpdate
) -> ProjectScope:
    """Create or update a project's scope"""
    # Check if project exists
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if scope already exists
    db_scope = get_project_scope(db, project_id)
    
    if db_scope:
        # Update existing scope
        scope_dict = scope_data.dict(exclude_unset=True)
        for key, value in scope_dict.items():
            setattr(db_scope, key, value)
        db_scope.UpdatedAt = datetime.utcnow()
    else:
        # Create new scope
        db_scope = ProjectScope(
            Id=str(uuid.uuid4()),
            ProjectId=project_id,
            IncludedItems=scope_data.IncludedItems,
            ExcludedItems=scope_data.ExcludedItems,
            StartDate=scope_data.StartDate,
            EndDate=scope_data.EndDate
        )
        db.add(db_scope)
    
    db.commit()
    db.refresh(db_scope)
    
    return db_scope

# Project stakeholder functions
def get_project_stakeholders(db: Session, project_id: str) -> List[ProjectStakeholder]:
    """Get a project's stakeholders"""
    return db.query(ProjectStakeholder).filter(ProjectStakeholder.ProjectId == project_id).all()

def get_stakeholder_by_id(db: Session, stakeholder_id: str) -> Optional[ProjectStakeholder]:
    """Get a stakeholder by ID"""
    return db.query(ProjectStakeholder).filter(ProjectStakeholder.Id == stakeholder_id).first()

def create_project_stakeholder(
    db: Session, 
    stakeholder: ProjectStakeholderCreate
) -> ProjectStakeholder:
    """Add a stakeholder to a project"""
    # Check if project exists
    db_project = get_project_by_id(db, stakeholder.ProjectId)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user exists
    db_user = db.query(User).filter(User.Id == stakeholder.UserId, User.IsDeleted == False).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if stakeholder already exists for this project/user combination
    existing_stakeholder = db.query(ProjectStakeholder).filter(
        ProjectStakeholder.ProjectId == stakeholder.ProjectId,
        ProjectStakeholder.UserId == stakeholder.UserId
    ).first()
    
    if existing_stakeholder:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a stakeholder in this project"
        )
    
    # Create stakeholder
    db_stakeholder = ProjectStakeholder(
        Id=str(uuid.uuid4()),
        ProjectId=stakeholder.ProjectId,
        UserId=stakeholder.UserId,
        Role=stakeholder.Role,
        Percentage=stakeholder.Percentage
    )
    
    db.add(db_stakeholder)
    db.commit()
    db.refresh(db_stakeholder)
    
    return db_stakeholder

def update_project_stakeholder(
    db: Session,
    stakeholder_id: str,
    stakeholder_update: ProjectStakeholderUpdate
) -> Optional[ProjectStakeholder]:
    """Update a project stakeholder"""
    db_stakeholder = get_stakeholder_by_id(db, stakeholder_id)
    if not db_stakeholder:
        return None
    
    # Update fields if they are provided
    update_data = stakeholder_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_stakeholder, key, value)
    
    db_stakeholder.UpdatedAt = datetime.utcnow()
    db.commit()
    db.refresh(db_stakeholder)
    
    return db_stakeholder

def delete_project_stakeholder(db: Session, stakeholder_id: str) -> bool:
    """Remove a stakeholder from a project"""
    db_stakeholder = get_stakeholder_by_id(db, stakeholder_id)
    if not db_stakeholder:
        return False
    
    db.delete(db_stakeholder)
    db.commit()
    
    return True