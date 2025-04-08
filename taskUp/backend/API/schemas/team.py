from pydantic import BaseModel, constr
from typing import Optional, List, Dict, Any
from datetime import datetime

# Base team schema
class TeamBase(BaseModel):
    Name: constr(min_length=1, max_length=100)
    Description: Optional[str] = None
    ColorIndex: Optional[int] = 0

# Create team schema
class TeamCreate(TeamBase):
    pass

# Update team schema
class TeamUpdate(BaseModel):
    Name: Optional[constr(min_length=1, max_length=100)] = None
    Description: Optional[str] = None
    ColorIndex: Optional[int] = None

# Team response schema
class TeamResponse(TeamBase):
    Id: str
    CreatedAt: datetime
    UpdatedAt: Optional[datetime] = None
    CreatedBy: str
    IsDeleted: bool = False
    MemberCount: int
    
    class Config:
     from_attributes = True 
 
# Team detail response
class TeamDetailResponse(TeamResponse):
    Members: List[Dict[str, Any]]
    Tasks: List[Dict[str, Any]]
    Projects: List[Dict[str, Any]]
    LeadMember: Optional[Dict[str, Any]]
    
    class Config:
     from_attributes = True

# Team list response
class TeamListResponse(BaseModel):
    items: List[TeamResponse]
    total: int