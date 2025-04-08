import argparse
import uuid
from sqlalchemy.orm import Session
from Db.session import Base, engine, SessionLocal
import API.Models as Models
from API.Models.AssignmentType import AssignmentType
from API.Models.Priority import Priority
from API.Models.Status import Status

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)
    print("All database tables created successfully!")

def drop_tables():
    """Drop all database tables"""
    Base.metadata.drop_all(bind=engine)
    print("All database tables dropped successfully!")

def setup_initial_data():
    """Set up initial data for the application"""
    db = SessionLocal()
    
    try:
        # Check if we have priorities set up
        if db.query(Priority).count() == 0:
            print("Setting up default priorities...")
            # Create priorities
            priorities = [
                Priority(Id=str(uuid.uuid4()), Name=Priority.LOW, ColorHex="#22C55E"),
                Priority(Id=str(uuid.uuid4()), Name=Priority.MEDIUM, ColorHex="#F59E0B"),
                Priority(Id=str(uuid.uuid4()), Name=Priority.HIGH, ColorHex="#EF4444")
            ]
            db.add_all(priorities)
        
        # Check if we have statuses set up
        if db.query(Status).count() == 0:
            print("Setting up default statuses...")
            # Create statuses
            statuses = [
                Status(Id=str(uuid.uuid4()), Name=Status.NOT_STARTED, ColorHex="#9CA3AF"),
                Status(Id=str(uuid.uuid4()), Name=Status.IN_PROGRESS, ColorHex="#3B82F6"),
                Status(Id=str(uuid.uuid4()), Name=Status.COMPLETED, ColorHex="#22C55E")
            ]
            db.add_all(statuses)
        
        # Check if we have assignment types set up
        if db.query(AssignmentType).count() == 0:
            print("Setting up default assignment types...")
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

def main():
    """Main entry point for database management"""
    parser = argparse.ArgumentParser(description="TaskUp Database Management")
    parser.add_argument("--init", action="store_true", help="Initialize the database with tables")
    parser.add_argument("--reset", action="store_true", help="Reset the database (drop and recreate all tables)")
    parser.add_argument("--seed", action="store_true", help="Seed the database with initial data")
    
    args = parser.parse_args()
    
    if args.init:
        create_tables()
        setup_initial_data()
    elif args.reset:
        drop_tables()
        create_tables()
        setup_initial_data()
    elif args.seed:
        setup_initial_data()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()