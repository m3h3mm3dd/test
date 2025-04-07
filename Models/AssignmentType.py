import uuid
from sqlalchemy import Column, String
from Db.session import Base


class AssignmentType(Base):
    """Table for task assignment types"""
    __tablename__ = "AssignmentType"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(50), nullable=False, unique=True)  # 'User' or 'Team'

    # Predefined types
    USER = "User"
    TEAM = "Team"