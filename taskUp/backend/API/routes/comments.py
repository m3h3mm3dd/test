from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from Db.session import get_db
from API.utils.dependencies import get_current_active_user
from API.Models.User import User
from API.Models.Comment import Comment
from API.schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from API.services.task_service import create_comment, update_comment, delete_comment, get_task_by_id

router = APIRouter(
    prefix="/tasks/{task_id}/comments",
    tags=["comments"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[CommentResponse])
def read_comments(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all comments for a task"""
    # Check if task exists
    task = get_task_by_id(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Return comments for the task
    return task.Comments

@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_task_comment(
    task_id: str,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a comment to a task"""
    # Ensure task ID in path matches the one in request
    if comment.TaskId != task_id:
        comment.TaskId = task_id
    
    return create_comment(db, comment, current_user.Id)

@router.put("/{comment_id}", response_model=CommentResponse)
def update_task_comment(
    task_id: str,
    comment_id: str,
    comment_update: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a comment"""
    # Find the comment
    db_comment = db.query(Comment).filter(Comment.Id == comment_id, Comment.TaskId == task_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Update the comment
    updated_comment = update_comment(db, comment_id, comment_update, current_user.Id)
    if not updated_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    return updated_comment

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_comment(
    task_id: str,
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a comment"""
    # Find the comment
    db_comment = db.query(Comment).filter(Comment.Id == comment_id, Comment.TaskId == task_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Delete the comment
    success = delete_comment(db, comment_id, current_user.Id)
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    return None