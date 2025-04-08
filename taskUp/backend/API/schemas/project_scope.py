from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

# Base project scope schema
class ProjectScopeBase(BaseModel):
    IncludedItems: Optional[str] = None
    ExcludedItems: Optional[str] = None
    StartDate: Optional[date] = None
    EndDate: Optional[date] = None

# Create project scope
class ProjectScopeCreate(ProjectScopeBase):
    pass

# Update project scope
class ProjectScopeUpdate(ProjectScopeBase):
    pass

# Project scope response
class ProjectScopeResponse(ProjectScopeBase):
    Id: str
    ProjectId: str
    IncludedItemsList: List[str]
    ExcludedItemsList: List[str]
    CreatedAt: datetime
    UpdatedAt: Optional[datetime] = None
    Duration: Optional[int] = None
    
    class Config:
      from_attributes = True