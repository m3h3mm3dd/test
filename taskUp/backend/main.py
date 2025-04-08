from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from Db.config import ALLOWED_ORIGINS, API_V1_PREFIX
from Db.session import get_db
from API.utils.config import APP_NAME, APP_DESCRIPTION, API_VERSION

# Import API routes
from API.routes import auth, users, projects, tasks, teams

app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=API_VERSION,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "app": APP_NAME,
        "version": API_VERSION,
        "status": "running"
    }

# Health check
@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Execute a simple query to check database connection
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status
    }

# Include API routers
app.include_router(auth.router, prefix=API_V1_PREFIX)
app.include_router(users.router, prefix=API_V1_PREFIX)
app.include_router(projects.router, prefix=API_V1_PREFIX)
app.include_router(tasks.router, prefix=API_V1_PREFIX)
app.include_router(teams.router, prefix=API_V1_PREFIX)