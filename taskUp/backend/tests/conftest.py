import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os

from Db.session import Base, get_db
from main import app
import uuid
from API.utils.auth import get_password_hash

# Test database URL
TEST_DATABASE_URL = "sqlite:///./test.db"

@pytest.fixture(scope="session")
def test_engine():
    """Create a test database engine"""
    # Remove test.db if it exists
    if os.path.exists("./test.db"):
        os.remove("./test.db")
        
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Import all models
    from API.Models import User, Project, Team, Priority, Status, AssignmentType
    from API.Models import Task, Comment, Attachment, Notification, ProjectStakeholder
    from API.Models import ProjectScope, ChatMessage, TeamMember, TaskAssignment
    
    # Store original Task table args
    original_table_args = Task.__table_args__
    
    # Temporarily modify Task.__table_args__ to remove the complex constraint
    Task.__table_args__ = ()
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Restore original table args
    Task.__table_args__ = original_table_args
    
    yield engine
    
    # Drop test database
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test.db"):
        os.remove("./test.db")