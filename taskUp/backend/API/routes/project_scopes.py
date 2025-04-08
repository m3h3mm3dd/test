from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from Db.session import get_db
from API.utils.dependencies import get_current_active_user
from API.Models.User import User
from API.schemas.project_scope import ProjectScopeCreate, ProjectScopeUpdate, ProjectScopeResponse
from API.services.project_service import get_project_by_id, get_project_scope, create_or_update_project_scope

router = APIRouter(
    prefix="/projects/{project_id}/scope",
    tags=["project scopes"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=ProjectScopeResponse)
def read_project_scope(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a project's scope"""
    # Check if project exists
    db_project = get_project_by_id(db, project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_scope = get_project_scope(db, project_id)
    if db_scope is None:
        raise HTTPException(status_code=404, detail="Project scope not found")
    
    return db_scope

@router.post("/", response_model=ProjectScopeResponse, status_code=status.HTTP_201_CREATED)
def create_project_scope(
    project_id: str,
    scope: ProjectScopeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a project scope"""
    # Check if project exists and user has rights
    db_project = get_project_by_id(db, project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only creator or admin can update scope
    if db_project.CreatedBy != current_user.Id and current_user.Role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this project"
        )
    
    # Check if scope already exists
    existing_scope = get_project_scope(db, project_id)
    if existing_scope is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project scope already exists. Use PUT to update."
        )
    
    return create_or_update_project_scope(db, project_id, scope)

@router.put("/", response_model=ProjectScopeResponse)
def update_project_scope(
    project_id: str,
    scope: ProjectScopeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a project scope"""
    # Check if project exists and user has rights
    db_project = get_project_by_id(db, project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only creator or admin can update scope
    if db_project.CreatedBy != current_user.Id and current_user.Role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this project"
        )
    
    return create_or_update_project_scope(db, project_id, scope)