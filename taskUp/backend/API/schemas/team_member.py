# taskUp/backend/API/schemas/team_member.py
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

# Base team member schema
class TeamMemberBase(BaseModel):
    TeamId: str
    UserId: str
    Role: Optional[str] = None
    IsLeader: bool = False

# Create team member schema
class TeamMemberCreate(TeamMemberBase):
    pass

# Update team member schema
class TeamMemberUpdate(BaseModel):
    Role: Optional[str] = None
    IsLeader: Optional[bool] = None

# Team member response schema
class TeamMemberResponse(TeamMemberBase):
    Id: str
    JoinedDate: datetime
    IsActive: bool
    UserName: str  # Derived from the User relationship
    
    class Config:
        from_attributes = True 