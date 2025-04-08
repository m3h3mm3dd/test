# taskUp/backend/API/schemas/notification.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class NotificationResponse(BaseModel):
    Id: str
    Type: str
    Message: str
    RelatedEntityId: Optional[str] = None
    RelatedEntityType: Optional[str] = None
    IsRead: bool
    CreatedAt: datetime
    TimeElapsed: str  # Human-readable time since creation
    
    class Config:
      from_attributes = True

class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int