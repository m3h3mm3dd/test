from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status, UploadFile
import uuid
from datetime import datetime
import os
import shutil

from API.Models.Task import Task
from API.Models.Comment import Comment
from API.Models.Attachment import Attachment
from API.Models.User import User
from API.Models.Status import Status
from API.Models.Priority import Priority
from API.Models.TaskAssignment import TaskAssignment
from API.Models.AssignmentType import AssignmentType
from API.schemas.task import TaskCreate, TaskUpdate, TaskAssignmentCreate
from API.schemas.comment import CommentCreate, CommentUpdate
from API.utils.config import UPLOAD_DIR

# Task functions
def get_task_by_id(db: Session, task_id: str) -> Optional[Task]:
    """Get a task by ID"""
    return db.query(Task).filter(Task.Id == task_id, Task.IsDeleted == False).first()

def get_tasks(
    db: Session, 
    user_id: str, 
    project_id: Optional[str] = None,
    team_id: Optional[str] = None,
    status_id: Optional[str] = None,
    priority_id: Optional[str] = None,
    completed: Optional[bool] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[Task]:
    """Get tasks filtered by various criteria"""
    query = db.query(Task).filter(Task.IsDeleted == False)
    
    # Filter by project
    if project_id:
        query = query.filter(Task.ProjectId == project_id)
    
    # Filter by team
    if team_id:
        query = query.filter(Task.TeamId == team_id)
    
    # Filter by status
    if status_id:
        query = query.filter(Task.StatusId == status_id)
    
    # Filter by priority
    if priority_id:
        query = query.filter(Task.PriorityId == priority_id)
    
    # Filter by completion status
    if completed is not None:
        query = query.filter(Task.Completed == completed)
    
    # Filter for tasks related to the user (created by or assigned to)
    query = query.filter(
        (Task.CreatedBy == user_id) | 
        (Task.Id.in_(
            db.query(TaskAssignment.TaskId).filter(TaskAssignment.UserId == user_id)
        ))
    )
    
    return query.order_by(Task.CreatedAt.desc()).offset(skip).limit(limit).all()

def count_tasks(
    db: Session, 
    user_id: str,
    project_id: Optional[str] = None,
    team_id: Optional[str] = None,
    status_id: Optional[str] = None,
    priority_id: Optional[str] = None,
    completed: Optional[bool] = None
) -> int:
    """Count tasks with filters"""
    query = db.query(Task).filter(Task.IsDeleted == False)
    
    # Apply the same filters as get_tasks
    if project_id:
        query = query.filter(Task.ProjectId == project_id)
    
    if team_id:
        query = query.filter(Task.TeamId == team_id)
    
    if status_id:
        query = query.filter(Task.StatusId == status_id)
    
    if priority_id:
        query = query.filter(Task.PriorityId == priority_id)
    
    if completed is not None:
        query = query.filter(Task.Completed == completed)
    
    query = query.filter(
        (Task.CreatedBy == user_id) | 
        (Task.Id.in_(
            db.query(TaskAssignment.TaskId).filter(TaskAssignment.UserId == user_id)
        ))
    )
    
    return query.count()

def create_task(db: Session, task: TaskCreate, user_id: str) -> Task:
    """Create a new task"""
    # Set default PriorityId if not provided
    if not task.PriorityId:
        default_priority = db.query(Priority).filter(Priority.Name == Priority.MEDIUM).first()
        task.PriorityId = default_priority.Id if default_priority else None
    
    # Set default StatusId if not provided
    if not task.StatusId:
        default_status = db.query(Status).filter(Status.Name == Status.NOT_STARTED).first()
        task.StatusId = default_status.Id if default_status else None
    
    # Check assignment type consistency
    assignment_type = db.query(AssignmentType).filter(AssignmentType.Id == task.AssignmentTypeId).first()
    if not assignment_type:
        raise HTTPException(status_code=404, detail="Assignment type not found")
    
    if assignment_type.Name == AssignmentType.TEAM and not task.TeamId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team ID is required for team assignment type"
        )
    
    # Create the task
    task_id = str(uuid.uuid4())
    
    db_task = Task(
        Id=task_id,
        ProjectId=task.ProjectId,
        TeamId=task.TeamId,
        AssignmentTypeId=task.AssignmentTypeId,
        Title=task.Title,
        Description=task.Description,
        IsSubtask=task.ParentTaskId is not None,
        ParentTaskId=task.ParentTaskId,
        Deadline=task.Deadline,
        BudgetAllocated=task.BudgetAllocated,
        PriorityId=task.PriorityId,
        StatusId=task.StatusId,
        CreatedBy=user_id,
        Completed=False
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return db_task

def update_task(db: Session, task_id: str, task_update: TaskUpdate) -> Optional[Task]:
    """Update task details"""
    db_task = get_task_by_id(db, task_id)
    if not db_task:
        return None
    
    # Update fields if they are provided
    update_data = task_update.dict(exclude_unset=True)
    
    # Check for assignment type consistency if being updated
    if "AssignmentTypeId" in update_data:
        assignment_type = db.query(AssignmentType).filter(AssignmentType.Id == update_data["AssignmentTypeId"]).first()
        if not assignment_type:
            raise HTTPException(status_code=404, detail="Assignment type not found")
        
        if assignment_type.Name == AssignmentType.TEAM and "TeamId" not in update_data and not db_task.TeamId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Team ID is required for team assignment type"
            )
        
        if assignment_type.Name == AssignmentType.USER:
            update_data["TeamId"] = None
    
    # Update task completion status
    if "Completed" in update_data and update_data["Completed"] != db_task.Completed:
        # If marking as completed, update the status
        if update_data["Completed"]:
            completed_status = db.query(Status).filter(Status.Name == Status.COMPLETED).first()
            if completed_status:
                update_data["StatusId"] = completed_status.Id
    
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    
    return db_task

def delete_task(db: Session, task_id: str) -> bool:
    """Soft delete a task"""
    db_task = get_task_by_id(db, task_id)
    if not db_task:
        return False
    
    db_task.IsDeleted = True
    db.commit()
    
    return True

# Task assignment functions
def assign_user_to_task(db: Session, assignment: TaskAssignmentCreate, assigner_id: str) -> TaskAssignment:
    """Assign a user to a task"""
    # Check if task exists
    db_task = get_task_by_id(db, assignment.TaskId)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if user exists
    db_user = db.query(User).filter(User.Id == assignment.UserId, User.IsDeleted == False).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is already assigned to the task
    existing_assignment = db.query(TaskAssignment).filter(
        TaskAssignment.TaskId == assignment.TaskId,
        TaskAssignment.UserId == assignment.UserId
    ).first()
    
    if existing_assignment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already assigned to this task"
        )
    
    # Create assignment
    db_assignment = TaskAssignment(
        Id=str(uuid.uuid4()),
        TaskId=assignment.TaskId,
        UserId=assignment.UserId,
        AssignedAt=datetime.utcnow(),
        AssignedBy=assigner_id
    )
    
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    
    return db_assignment

def remove_user_from_task(db: Session, task_id: str, user_id: str) -> bool:
    """Remove a user from a task"""
    # Find the assignment
    db_assignment = db.query(TaskAssignment).filter(
        TaskAssignment.TaskId == task_id,
        TaskAssignment.UserId == user_id
    ).first()
    
    if not db_assignment:
        return False
    
    db.delete(db_assignment)
    db.commit()
    
    return True

# Comment functions
def create_comment(db: Session, comment: CommentCreate, user_id: str) -> Comment:
    """Create a comment on a task"""
    # Check if task exists
    db_task = get_task_by_id(db, comment.TaskId)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Create comment
    db_comment = Comment(
        Id=str(uuid.uuid4()),
        TaskId=comment.TaskId,
        UserId=user_id,
        Content=comment.Content,
        CreatedAt=datetime.utcnow()
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return db_comment

def update_comment(db: Session, comment_id: str, comment_update: CommentUpdate, user_id: str) -> Optional[Comment]:
    """Update a comment"""
    # Find the comment
    db_comment = db.query(Comment).filter(Comment.Id == comment_id).first()
    if not db_comment:
        return None
    
    # Check if the user is the comment owner
    if db_comment.UserId != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own comments"
        )
    
    # Update the comment
    db_comment.Content = comment_update.Content
    db_comment.UpdatedAt = datetime.utcnow()
    
    db.commit()
    db.refresh(db_comment)
    
    return db_comment

def delete_comment(db: Session, comment_id: str, user_id: str) -> bool:
    """Delete a comment"""
    # Find the comment
    db_comment = db.query(Comment).filter(Comment.Id == comment_id).first()
    if not db_comment:
        return False
    
    # Check if the user is the comment owner
    if db_comment.UserId != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments"
        )
    
    db.delete(db_comment)
    db.commit()
    
    return True

# Attachment functions
def save_attachment(
    file: UploadFile, 
    task_id: str, 
    user_id: str, 
    db: Session
) -> Attachment:
    """Save an uploaded file as an attachment to a task"""
    # Check if task exists
    db_task = get_task_by_id(db, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Create a unique filename
    unique_id = uuid.uuid4()
    original_filename = file.filename
    filename_parts = os.path.splitext(original_filename)
    extension = filename_parts[1] if len(filename_parts) > 1 else ""
    safe_filename = f"{unique_id}{extension}"
    
    # Create task-specific directory if it doesn't exist
    task_upload_dir = os.path.join(UPLOAD_DIR, task_id)
    os.makedirs(task_upload_dir, exist_ok=True)
    
    # Save the file
    file_path = os.path.join(task_upload_dir, safe_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Create attachment record
    db_attachment = Attachment(
        Id=str(unique_id),
        TaskId=task_id,
        FileName=original_filename,
        FileType=file.content_type,
        FileSize=file_size,
        FilePath=file_path,
        UploadedById=user_id,
        UploadedAt=datetime.utcnow()
    )
    
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    
    return db_attachment

def delete_attachment(db: Session, attachment_id: str, user_id: str) -> bool:
    """Delete an attachment"""
    # Find the attachment
    db_attachment = db.query(Attachment).filter(Attachment.Id == attachment_id).first()
    if not db_attachment:
        return False
    
    # Check permissions (uploader or task creator)
    db_task = get_task_by_id(db, db_attachment.TaskId)
    if db_attachment.UploadedById != user_id and db_task.CreatedBy != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this attachment"
        )
    
    # Delete the file
    try:
        if os.path.exists(db_attachment.FilePath):
            os.remove(db_attachment.FilePath)
    except Exception as e:
        # Log the error but continue with record deletion
        print(f"Error deleting file: {e}")
    
    db.delete(db_attachment)
    db.commit()
    
    return True