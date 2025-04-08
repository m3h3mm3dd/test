from session import Base, engine
from Models import *

def init_db():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def setup_initial_data():
    """Set up initial data for the application"""
    from sqlalchemy.orm import Session
    from session import SessionLocal
    import uuid
    
    db = SessionLocal()
    
    try:
        # Check if we have priorities set up
        if db.query(Priority).count() == 0:
            # Create priorities
            priorities = [
                Priority(Id=str(uuid.uuid4()), Name=Priority.LOW, ColorHex="#22C55E"),
                Priority(Id=str(uuid.uuid4()), Name=Priority.MEDIUM, ColorHex="#F59E0B"),
                Priority(Id=str(uuid.uuid4()), Name=Priority.HIGH, ColorHex="#EF4444")
            ]
            db.add_all(priorities)
        
        # Check if we have statuses set up
        if db.query(Status).count() == 0:
            # Create statuses
            statuses = [
                Status(Id=str(uuid.uuid4()), Name=Status.NOT_STARTED, ColorHex="#9CA3AF"),
                Status(Id=str(uuid.uuid4()), Name=Status.IN_PROGRESS, ColorHex="#3B82F6"),
                Status(Id=str(uuid.uuid4()), Name=Status.COMPLETED, ColorHex="#22C55E")
            ]
            db.add_all(statuses)
        
        # Check if we have assignment types set up
        if db.query(AssignmentType).count() == 0:
            # Create assignment types
            types = [
                AssignmentType(Id=str(uuid.uuid4()), Name=AssignmentType.USER),
                AssignmentType(Id=str(uuid.uuid4()), Name=AssignmentType.TEAM)
            ]
            db.add_all(types)
        
        db.commit()
        print("Initial data setup complete!")
        
    except Exception as e:
        db.rollback()
        print(f"Error setting up initial data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    setup_initial_data()