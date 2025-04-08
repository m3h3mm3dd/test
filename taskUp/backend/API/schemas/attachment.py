from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Attachment response schema
class AttachmentResponse(BaseModel):
    Id: str
    TaskId: str
    FileName: str
    FileType: Optional[str]
    FileSize: int
    FilePath: str
    UploadedById: str
    UploadedAt: datetime
    UploadedBy: dict  # Basic user info
    FileExtension: str  # Derived property
    HumanReadableSize: str  # Derived property
    
    class Config:
      from_attributes = True