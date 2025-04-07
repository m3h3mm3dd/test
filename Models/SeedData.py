import uuid
from datetime import datetime
from models.assignment_type import AssignmentType
from models.priority import Priority
from models.status import Status


class SeedData:
    """Helper class to populate required lookup tables"""

    @staticmethod
    def init_lookup_tables(db_session):
        """Initialize lookup tables with required values"""
        SeedData.init_assignment_types(db_session)
        SeedData.init_priorities(db_session)
        SeedData.init_statuses(db_session)

    @staticmethod
    def init_assignment_types(db_session):
        """Create assignment types if they don't exist"""
        # Check if data exists
        existing_types = db_session.query(AssignmentType).count()
        if existing_types > 0:
            return

        # Create assignment types
        user_type = AssignmentType(Id=str(uuid.uuid4()), Name=AssignmentType.USER)
        team_type = AssignmentType(Id=str(uuid.uuid4()), Name=AssignmentType.TEAM)

        db_session.add_all([user_type, team_type])
        db_session.commit()

    @staticmethod
    def init_priorities(db_session):
        """Create task priorities if they don't exist"""
        # Check if data exists
        existing_priorities = db_session.query(Priority).count()
        if existing_priorities > 0:
            return

        # Create priorities with colors
        low = Priority(
            Id=str(uuid.uuid4()),
            Name=Priority.LOW,
            ColorHex=Priority.get_priority_color(Priority.LOW)
        )
        medium = Priority(
            Id=str(uuid.uuid4()),
            Name=Priority.MEDIUM,
            ColorHex=Priority.get_priority_color(Priority.MEDIUM)
        )
        high = Priority(
            Id=str(uuid.uuid4()),
            Name=Priority.HIGH,
            ColorHex=Priority.get_priority_color(Priority.HIGH)
        )

        db_session.add_all([low, medium, high])
        db_session.commit()

    @staticmethod
    def init_statuses(db_session):
        """Create task statuses if they don't exist"""
        # Check if data exists
        existing_statuses = db_session.query(Status).count()
        if existing_statuses > 0:
            return

        # Create statuses with colors
        not_started = Status(
            Id=str(uuid.uuid4()),
            Name=Status.NOT_STARTED,
            ColorHex=Status.get_status_color(Status.NOT_STARTED)
        )
        in_progress = Status(
            Id=str(uuid.uuid4()),
            Name=Status.IN_PROGRESS,
            ColorHex=Status.get_status_color(Status.IN_PROGRESS)
        )
        completed = Status(
            Id=str(uuid.uuid4()),
            Name=Status.COMPLETED,
            ColorHex=Status.get_status_color(Status.COMPLETED)
        )

        db_session.add_all([not_started, in_progress, completed])
        db_session.commit()