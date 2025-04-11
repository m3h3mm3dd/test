from API.Models import *
from Db.session import Base, engine
from Db.db_manager import setup_initial_data

def init_db():
    """Create all tables and set up initial data"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    
    print("Setting up initial data...")
    setup_initial_data()
    print("Database initialization complete!")

if __name__ == "__main__":
    init_db()