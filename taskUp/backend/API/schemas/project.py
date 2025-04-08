from pydantic import BaseModel, validator, constr
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

# Base project schema
class ProjectBase(BaseModel):
    Name: constr(min_length=1, max_length=100) # type: ignore
    Description: Optional[str] = None
    TotalBudget: Optional[Decimal] = 0.0
    
    @validator('TotalBudget')
    def budget_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError('Budget must be a positive value')
        return v

# Create project
class ProjectCreate(ProjectBase):
    pass

# Update project
class ProjectUpdate(BaseModel):
    Name: Optional[constr(min_length=1, max_length=100)] = None # type: ignore
    Description: Optional[str] = None
    TotalBudget: Optional[Decimal] = None
    Status: Optional[str] = None
    
    @validator('TotalBudget')
    def budget_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError('Budget must be a positive value')
        return v

# Project response
class ProjectResponse(ProjectBase):
    Id: str
    Progress: int
    Status: str
    RemainingBudget: Decimal
    CreatedAt: datetime
    UpdatedAt: Optional[datetime] = None
    CreatedBy: str
    
    class Config:
     from_attributes = True

# Project detail response
class ProjectDetailResponse(ProjectResponse):
    TeamCount: int
    TaskCount: int
    CompletedTaskCount: int
    
    class Config:
     from_attributes = True

# Project list response
class ProjectListResponse(BaseModel):
    items: List[ProjectResponse]
    total: int