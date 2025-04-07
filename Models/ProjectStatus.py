import uuid
from sqlalchemy import Column, String, Text, Integer
from sqlalchemy.orm import relationship
from Db.session import Base


class ProjectStatus(Base):
    __tablename__ = "ProjectStatus"
    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    Name = Column(String(50), unique=True, nullable=False)
    Description = Column(Text)
    Color = Column(String(50))  # For frontend color coding
    DisplayOrder = Column(Integer, default=0)  # For ordering in UI

    # Relationships
    Project = relationship("Project", back_populates="ProjectStatus")