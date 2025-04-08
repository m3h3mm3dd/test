# taskUp/backend/API/routes/notifications.py
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from Db.session import get_db
from API.utils.dependencies import get_current_active_user
from API.Models.User import User
from API.Models.Notification import Notification
from API.schemas.notification import NotificationResponse, NotificationListResponse
from API.services.notification_service import (
    get_user_notifications, mark_notification_as_read, 
    mark_all_notifications_as_read, count_unread_notifications
)

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=NotificationListResponse)
def read_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user notifications"""
    notifications = get_user_notifications(db, current_user.Id, skip, limit, unread_only)
    total = count_unread_notifications(db, current_user.Id) if unread_only else len(notifications)
    return {"items": notifications, "total": total}

@router.post("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark a notification as read"""
    # First check if the notification belongs to this user
    notification = db.query(Notification).filter(
        Notification.Id == notification_id,
        Notification.UserId == current_user.Id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    success = mark_notification_as_read(db, notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return None

@router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark all notifications as read"""
    mark_all_notifications_as_read(db, current_user.Id)
    return None

@router.get("/count", response_model=dict)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get count of unread notifications"""
    count = count_unread_notifications(db, current_user.Id)
    return {"count": count}