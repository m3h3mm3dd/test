from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os

from Db.session import get_db
from API.utils.dependencies import get_current_active_user
from API.Models.User import User
from API.Models.Attachment import Attachment
from API.schemas.attachment import AttachmentResponse
from API.services.task_service import save_attachment, delete_attachment, get_task_by_id

router = APIRouter(
    prefix="/tasks/{task_id}/attachments",
    tags=["attachments"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[AttachmentResponse])
def read_attachments(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all attachments for a task"""
    # Check if task exists
    task = get_task_by_id(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Return attachments for the task
    return task.Attachments

@router.post("/", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
def upload_attachment(
    task_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload file attachment for a task"""
    return save_attachment(file, task_id, current_user.Id, db)

@router.get("/{attachment_id}", response_class=FileResponse)
def download_attachment(
    task_id: str,
    attachment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Download a task attachment"""
    # Find the attachment
    db_attachment = db.query(Attachment).filter(
        Attachment.Id == attachment_id, 
        Attachment.TaskId == task_id
    ).first()
    
    if not db_attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    # Check if file exists
    if not os.path.exists(db_attachment.FilePath):
        raise HTTPException(status_code=404, detail="Attachment file not found")
    
    return FileResponse(
        db_attachment.FilePath, 
        filename=db_attachment.FileName,
        media_type=db_attachment.FileType
    )

@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_attachment(
    task_id: str,
    attachment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete an attachment"""
    # Find the attachment
    db_attachment = db.query(Attachment).filter(
        Attachment.Id == attachment_id, 
        Attachment.TaskId == task_id
    ).first()
    
    if not db_attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    # Delete the attachment
    success = delete_attachment(db, attachment_id, current_user.Id)
    if not success:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    return None