# taskUp/backend/API/services/notification_service.py
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from API.Models.Notification import Notification
from API.Models.User import User

# Notification types
TASK_ASSIGNED = "task_assigned"
TASK_COMPLETED = "task_completed"
COMMENT_ADDED = "comment_added"
PROJECT_UPDATED = "project_updated"
TEAM_ADDED = "team_added"

def create_notification(
    db: Session,
    user_id: str,
    notification_type: str,
    message: str,
    entity_id: Optional[str] = None,
    entity_type: Optional[str] = None
) -> Notification:
    """Create a notification in the database"""
    notification = Notification(
        Id=str(uuid.uuid4()),
        UserId=user_id,
        Type=notification_type,
        Message=message,
        RelatedEntityId=entity_id,
        RelatedEntityType=entity_type,
        IsRead=False,
        CreatedAt=datetime.utcnow()
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification

def get_user_notifications(
    db: Session, 
    user_id: str,
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False
) -> List[Notification]:
    """Get notifications for a user"""
    query = db.query(Notification).filter(Notification.UserId == user_id)
    
    if unread_only:
        query = query.filter(Notification.IsRead == False)
    
    return query.order_by(Notification.CreatedAt.desc()).offset(skip).limit(limit).all()

def mark_notification_as_read(db: Session, notification_id: str) -> bool:
    """Mark a notification as read"""
    notification = db.query(Notification).filter(Notification.Id == notification_id).first()
    
    if not notification:
        return False
    
    notification.IsRead = True
    db.commit()
    
    return True

def mark_all_notifications_as_read(db: Session, user_id: str) -> int:
    """Mark all notifications for a user as read"""
    result = db.query(Notification).filter(
        Notification.UserId == user_id,
        Notification.IsRead == False
    ).update({"IsRead": True})
    
    db.commit()
    
    return result

def count_unread_notifications(db: Session, user_id: str) -> int:
    """Count unread notifications for a user"""
    return db.query(Notification).filter(
        Notification.UserId == user_id,
        Notification.IsRead == False
    ).count()

# Background task functions
def notify_task_assignment(
    background_tasks: BackgroundTasks,
    db: Session,
    user_id: str,
    task_id: str,
    task_title: str,
    assigner_name: str
):
    """Send task assignment notification"""
    message = f"{assigner_name} assigned you to task '{task_title}'"
    
    background_tasks.add_task(
        create_notification,
        db=db,
        user_id=user_id,
        notification_type=TASK_ASSIGNED,
        message=message,
        entity_id=task_id,
        entity_type="Task"
    )

def notify_task_completed(
    background_tasks: BackgroundTasks,
    db: Session,
    task_id: str,
    task_title: str,
    completer_id: str,
    completer_name: str
):
    """Notify task stakeholders about completion"""
    from API.Models.Task import Task
    from API.Models.TaskAssignment import TaskAssignment
    
    task = db.query(Task).filter(Task.Id == task_id).first()
    if not task:
        return
    
    # Notify task creator if not the completer
    if task.CreatedBy != completer_id:
        creator = db.query(User).filter(User.Id == task.CreatedBy).first()
        if creator:
            message = f"{completer_name} completed the task '{task_title}'"
            background_tasks.add_task(
                create_notification,
                db=db,
                user_id=creator.Id,
                notification_type=TASK_COMPLETED,
                message=message,
                entity_id=task_id,
                entity_type="Task"
            )
    
    # Notify other assigned users
    assigned_users = db.query(User).join(TaskAssignment).filter(
        TaskAssignment.TaskId == task_id,
        User.Id != completer_id
    ).all()
    
    message = f"{completer_name} completed the task '{task_title}'"
    for user in assigned_users:
        background_tasks.add_task(
            create_notification,
            db=db,
            user_id=user.Id,
            notification_type=TASK_COMPLETED,
            message=message,
            entity_id=task_id,
            entity_type="Task"
        )

def notify_comment_added(
    background_tasks: BackgroundTasks,
    db: Session,
    task_id: str,
    task_title: str,
    comment_user_id: str,
    comment_user_name: str
):
    """Notify task participants about new comment"""
    from API.Models.Task import Task
    from API.Models.TaskAssignment import TaskAssignment
    
    task = db.query(Task).filter(Task.Id == task_id).first()
    if not task:
        return
    
    # Get all assigned users except commenter
    assigned_users = db.query(User).join(TaskAssignment).filter(
        TaskAssignment.TaskId == task_id,
        User.Id != comment_user_id
    ).all()
    
    # Also notify task creator
    if task.CreatedBy != comment_user_id:
        task_creator = db.query(User).filter(User.Id == task.CreatedBy).first()
        if task_creator and task_creator not in assigned_users:
            assigned_users.append(task_creator)
    
    # Create notifications
    message = f"{comment_user_name} commented on task '{task_title}'"
    
    for user in assigned_users:
        background_tasks.add_task(
            create_notification,
            db=db,
            user_id=user.Id,
            notification_type=COMMENT_ADDED,
            message=message,
            entity_id=task_id,
            entity_type="Task"
        )