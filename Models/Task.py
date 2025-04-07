import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship, validates
from Db.session import Base


class Task(Base):

    __tablename__ = "Task"

    Id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ProjectId = Column(String(36), ForeignKey("Project.Id", ondelete="CASCADE"), nullable=False)
    TeamId = Column(String(36), ForeignKey("Team.Id", ondelete="CASCADE"), nullable=True)

    #teama yoxsa usere
    AssignmentTypeId = Column(String(36), ForeignKey("AssignmentType.Id"), nullable=False)

    Title = Column(String(100), nullable=False)
    Description = Column(Text)
    IsSubtask = Column(Boolean, default=False)

    #subtasklari create eleyende lazim ola biler
    ParentTaskId = Column(String(36), ForeignKey("Task.Id", ondelete="CASCADE"), nullable=True)

    Deadline = Column(DateTime)
    BudgetUsed = Column(Integer, default=0)
    PriorityId = Column(String(36), ForeignKey("Priority.Id"), nullable=False)
    StatusId = Column(String(36), ForeignKey("Status.Id"), nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, onupdate=datetime.utcnow)
    CreatedBy = Column(String(36), ForeignKey("User.Id"), nullable=False)
    IsDeleted = Column(Boolean, default=False)
    Completed = Column(Boolean, default=False)

    # ensure assignment integrity
    __table_args__ = (
        CheckConstraint(
            "(TeamId IS NOT NULL AND EXISTS (SELECT 1 FROM AssignmentType WHERE Id = AssignmentTypeId AND Name = 'Team')) OR "
            "(TeamId IS NULL AND EXISTS (SELECT 1 FROM AssignmentType WHERE Id = AssignmentTypeId AND Name = 'User'))",
            name="check_task_assignment"
        ),
    )

    # Relationships
    Project = relationship("Project", back_populates="Tasks")
    Team = relationship("Team", back_populates="Tasks")
    AssignedUsers = relationship("User", secondary="TaskAssignment", back_populates="TasksAssigned")
    Subtasks = relationship("Task", backref="ParentTask", remote_side=[Id], cascade="all, delete-orphan")
    Comments = relationship("Comment", back_populates="Task", cascade="all, delete-orphan")
    Attachments = relationship("Attachment", back_populates="Task", cascade="all, delete-orphan")
    Priority = relationship("Priority")
    Status = relationship("Status")
    AssignmentType = relationship("AssignmentType")
    Creator = relationship("User", foreign_keys=[CreatedBy], back_populates="TasksCreated")
    Expenses = relationship("Expense", back_populates="Task", cascade="all, delete-orphan")

    # @validates('AssignmentTypeId', 'TeamId')
    # def validate_assignment(self, key, value):
    #     """Ensure task assignment is valid based on type"""
    #     # Validation logic will now rely on the database constraint
    #     return value