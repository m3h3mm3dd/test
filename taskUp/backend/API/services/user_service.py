from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException, status
import uuid

from API.Models.User import User
from API.schemas.user import UserCreate, UserUpdate
from API.utils.auth import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email"""
    return db.query(User).filter(User.Email == email, User.IsDeleted == False).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Get a user by ID"""
    return db.query(User).filter(User.Id == user_id, User.IsDeleted == False).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Get a list of users"""
    return db.query(User).filter(User.IsDeleted == False).offset(skip).limit(limit).all()

def count_users(db: Session) -> int:
    """Count total number of non-deleted users"""
    return db.query(User).filter(User.IsDeleted == False).count()

def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user"""
    # Check if user with this email already exists
    db_user = get_user_by_email(db, user.Email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with hashed password
    try:
        new_user = User(
            Id=str(uuid.uuid4()),
            Email=user.Email,
            FirstName=user.FirstName,
            LastName=user.LastName,
            JobTitle=user.JobTitle,
            PasswordHash=get_password_hash(user.Password),
            Role="User"  # Default role
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
    except Exception as e:
        db.rollback()
        print(f"Error creating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

def update_user(db: Session, user_id: str, user_update: UserUpdate) -> Optional[User]:
    """Update user details"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    # Update fields if they are provided
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    
    return db_user

def change_password(db: Session, user_id: str, current_password: str, new_password: str) -> bool:
    """Change a user's password"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    # Verify current password
    if not verify_password(current_password, db_user.PasswordHash):
        return False
    
    # Update to new password
    db_user.PasswordHash = get_password_hash(new_password)
    db.commit()
    
    return True

def delete_user(db: Session, user_id: str) -> bool:
    """Soft delete a user"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    db_user.IsDeleted = True
    db.commit()
    
    return True

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user by email and password"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    
    if not verify_password(password, user.PasswordHash):
        return None
    
    return user