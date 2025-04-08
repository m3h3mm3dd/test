from pydantic import BaseModel, constr
from typing import Optional
from datetime import datetime

# Base comment schema
class CommentBase(BaseModel):
    Content: constr(min_length=1)

# Create comment schema
class CommentCreate(CommentBase):
    TaskId: str

# Update comment schema
class CommentUpdate(BaseModel):
    Content: constr(min_length=1)

# Comment response schema
class CommentResponse(CommentBase):
    Id: str
    TaskId: str
    UserId: str
    CreatedAt: datetime
    UpdatedAt: Optional[datetime] = None
    UserName: str  # Derived from the User relationship
    TimeElapsed: str  # Human-readable time since creation
    
    class Config:
     from_attributes = True