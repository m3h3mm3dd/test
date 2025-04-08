from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from Db.session import get_db
from API.utils.dependencies import get_current_active_user
from API.Models.User import User
from API.schemas.project_stakeholder import ProjectStakeholderCreate, ProjectStakeholderUpdate, ProjectStakeholderResponse
from API.services.project_service import (
    get_project_by_id, get_project_stakeholders, get_stakeholder_by_id,
    create_project_stakeholder, update_project_stakeholder, delete_project_stakeholder
)

router = APIRouter(
    prefix="/projects/{project_id}/stakeholders",
    tags=["project stakeholders"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[ProjectStakeholderResponse])
def read_project_stakeholders(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all stakeholders for a project"""
    # Check if project exists
    db_project = get_project_by_id(db, project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return get_project_stakeholders(db, project_id)

@router.post("/", response_model=ProjectStakeholderResponse, status_code=status.HTTP_201_CREATED)
def add_project_stakeholder(
    project_id: str,
    stakeholder: ProjectStakeholderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a stakeholder to a project"""
    # Check if project exists and user has rights
    db_project = get_project_by_id(db, project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only creator or admin can add stakeholders
    if db_project.CreatedBy != current_user.Id and current_user.Role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this project"
        )
    
    # Ensure the ProjectId in the path matches the one in the request body
    if stakeholder.ProjectId != project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project ID in path does not match Project ID in request body"
        )
    
    return create_project_stakeholder(db, stakeholder)

@router.put("/{stakeholder_id}", response_model=ProjectStakeholderResponse)
def update_stakeholder(
    project_id: str,
    stakeholder_id: str,
    stakeholder_update: ProjectStakeholderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a project stakeholder"""
    # Check if project exists and user has rights
    db_project = get_project_by_id(db, project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only creator or admin can update stakeholders
    if db_project.CreatedBy != current_user.Id and current_user.Role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this project"
        )
    
    # Check if stakeholder exists
    db_stakeholder = get_stakeholder_by_id(db, stakeholder_id)
    if db_stakeholder is None:
        raise HTTPException(status_code=404, detail="Stakeholder not found")
    
    # Ensure stakeholder belongs to this project
    if db_stakeholder.ProjectId != project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stakeholder does not belong to this project"
        )
    
    updated_stakeholder = update_project_stakeholder(db, stakeholder_id, stakeholder_update)
    return updated_stakeholder

@router.delete("/{stakeholder_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_stakeholder(
    project_id: str,
    stakeholder_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove a stakeholder from a project"""
    # Check if project exists and user has rights
    db_project = get_project_by_id(db, project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only creator or admin can remove stakeholders
    if db_project.CreatedBy != current_user.Id and current_user.Role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this project"
        )
    
    # Check if stakeholder exists
    db_stakeholder = get_stakeholder_by_id(db, stakeholder_id)
    if db_stakeholder is None:
        raise HTTPException(status_code=404, detail="Stakeholder not found")
    
    # Ensure stakeholder belongs to this project
    if db_stakeholder.ProjectId != project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stakeholder does not belong to this project"
        )
    
    success = delete_project_stakeholder(db, stakeholder_id)
    if not success:
        raise HTTPException(status_code=404, detail="Stakeholder not found")
    
    return None