from pydantic import BaseModel, EmailStr, constr, validator, Field
from typing import Optional, List
from datetime import datetime
import re

# Base schemas
class UserBase(BaseModel):
    Email: EmailStr
    FirstName: constr(min_length=1, max_length=50)
    LastName: constr(min_length=1, max_length=50)
    JobTitle: Optional[str] = None

# Create / Register user
class UserCreate(UserBase):
    Password: constr(min_length=8)
    
    @validator('Password')
    def password_complexity(cls, v):
        """Validate password complexity"""
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

# Update user
class UserUpdate(BaseModel):
    FirstName: Optional[constr(min_length=1, max_length=50)] = None
    LastName: Optional[constr(min_length=1, max_length=50)] = None
    JobTitle: Optional[str] = None
    ProfileUrl: Optional[str] = None

# User password change
class UserPasswordChange(BaseModel):
    CurrentPassword: str
    NewPassword: constr(min_length=8) # type: ignore
    
    @validator('NewPassword')
    def password_complexity(cls, v):
        """Validate password complexity"""
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

# Login request
class LoginRequest(BaseModel):
    Email: EmailStr
    Password: str

# Token response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str

# User response
class UserResponse(BaseModel):
    Id: str
    Email: EmailStr
    FirstName: str
    LastName: str
    JobTitle: Optional[str] = None
    ProfileUrl: Optional[str] = None
    Role: str
    CreatedAt: datetime
    
    class Config:
      from_attributes = True

# User list response
class UserListResponse(BaseModel):
    items: List[UserResponse]
    total: int