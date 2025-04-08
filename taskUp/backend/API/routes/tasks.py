from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from Db.session import get_db
from API.utils.dependencies import get_current_active_user
from API.Models.User import User
from API.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskDetailResponse, TaskListResponse, TaskAssignmentCreate
from API.services.task_service import (
    get_task_by_id, get_tasks, count_tasks, create_task, update_task, delete_task,
    assign_user_to_task, remove_user_from_task
)

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_new_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new task"""
    return create_task(db, task, current_user.Id)

@router.get("/", response_model=TaskListResponse)
def read_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    project_id: Optional[str] = None,
    team_id: Optional[str] = None,
    status_id: Optional[str] = None,
    priority_id: Optional[str] = None,
    completed: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of tasks with filters"""
    tasks = get_tasks(
        db, 
        current_user.Id, 
        project_id=project_id,
        team_id=team_id,
        status_id=status_id,
        priority_id=priority_id,
        completed=completed,
        skip=skip, 
        limit=limit
    )
    total = count_tasks(
        db, 
        current_user.Id,
        project_id=project_id,
        team_id=team_id,
        status_id=status_id,
        priority_id=priority_id,
        completed=completed
    )
    return {"items": tasks, "total": total}

@router.get("/{task_id}", response_model=TaskDetailResponse)
def read_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get task details by ID"""
    db_task = get_task_by_id(db, task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task_details(
    task_id: str,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update task details"""
    # Check if task exists
    db_task = get_task_by_id(db, task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update task
    updated_task = update_task(db, task_id, task_update)
    return updated_task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_by_id(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a task"""
    # Check if task exists
    db_task = get_task_by_id(db, task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Only creator can delete task
    if db_task.CreatedBy != current_user.Id and current_user.Role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task"
        )
    
    success = delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return None

@router.post("/{task_id}/assign", status_code=status.HTTP_201_CREATED)
def assign_user(
    task_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Assign a user to a task"""
    # Create assignment object
    assignment = TaskAssignmentCreate(TaskId=task_id, UserId=user_id)
    
    # Assign user to task
    db_assignment = assign_user_to_task(db, assignment, current_user.Id)
    
    return {"message": "User assigned to task successfully"}

@router.delete("/{task_id}/assign/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user(
    task_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove a user from a task"""
    # Check if task exists
    db_task = get_task_by_id(db, task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Only task creator or admin can remove assignments
    if db_task.CreatedBy != current_user.Id and current_user.Role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify task assignments"
        )
    
    success = remove_user_from_task(db, task_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    return None