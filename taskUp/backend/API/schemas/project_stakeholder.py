from pydantic import BaseModel, validator, Field
from typing import Optional
from datetime import datetime

# Base project stakeholder schema
class ProjectStakeholderBase(BaseModel):
    ProjectId: str
    UserId: str
    Role: Optional[str] = None
    Percentage: float = Field(..., ge=0, le=100)
    
    @validator('Percentage')
    def percentage_range(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Percentage must be between 0 and 100')
        return v

# Create project stakeholder
class ProjectStakeholderCreate(ProjectStakeholderBase):
    pass

# Update project stakeholder
class ProjectStakeholderUpdate(BaseModel):
    Role: Optional[str] = None
    Percentage: Optional[float] = Field(None, ge=0, le=100)
    
    @validator('Percentage')
    def percentage_range(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError('Percentage must be between 0 and 100')
        return v

# Project stakeholder response
class ProjectStakeholderResponse(ProjectStakeholderBase):
    Id: str
    CreatedAt: datetime
    UpdatedAt: Optional[datetime] = None
    UserName: str  # Derived from the User relationship
    
    class Config:
      from_attributes = True