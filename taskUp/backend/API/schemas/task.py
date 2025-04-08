from pydantic import BaseModel, validator, constr
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal

# Base task schema
class TaskBase(BaseModel):
    Title: constr(min_length=1, max_length=100)
    Description: Optional[str] = None
    Deadline: Optional[date] = None
    BudgetAllocated: Optional[Decimal] = 0
    PriorityId: Optional[str] = None
    StatusId: Optional[str] = None
    
    @validator('BudgetAllocated')
    def budget_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError('Budget must be a positive value')
        return v

# Create task schema
class TaskCreate(TaskBase):
    ProjectId: str
    TeamId: Optional[str] = None
    AssignmentTypeId: str
    ParentTaskId: Optional[str] = None

# Update task schema
class TaskUpdate(BaseModel):
    Title: Optional[constr(min_length=1, max_length=100)] = None
    Description: Optional[str] = None
    Deadline: Optional[date] = None
    BudgetAllocated: Optional[Decimal] = None
    PriorityId: Optional[str] = None
    StatusId: Optional[str] = None
    TeamId: Optional[str] = None
    AssignmentTypeId: Optional[str] = None
    Completed: Optional[bool] = None
    
    @validator('BudgetAllocated')
    def budget_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError('Budget must be a positive value')
        return v

# Task assignment schema
class TaskAssignmentCreate(BaseModel):
    TaskId: str
    UserId: str

# Task response schema
class TaskResponse(TaskBase):
    Id: str
    ProjectId: str
    TeamId: Optional[str] = None
    AssignmentTypeId: str
    ParentTaskId: Optional[str] = None
    CreatedAt: datetime
    UpdatedAt: Optional[datetime] = None
    CreatedBy: str
    IsDeleted: bool = False
    Completed: bool = False
    Status: Dict[str, Any]  # Include status data
    Priority: Dict[str, Any]  # Include priority data
    
    class Config:
        orm_mode = True

# Task detail response
class TaskDetailResponse(TaskResponse):
    Project: Dict[str, Any]
    Team: Optional[Dict[str, Any]]
    AssignedUsers: List[Dict[str, Any]]
    Comments: List[Dict[str, Any]]
    Attachments: List[Dict[str, Any]]
    Subtasks: List[Dict[str, Any]]
    
    class Config:
        orm_mode = True

# Task list response
class TaskListResponse(BaseModel):
    items: List[TaskResponse]
    total: int