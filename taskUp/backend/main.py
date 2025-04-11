# taskUp/backend/main.py
from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from Db.config import ALLOWED_ORIGINS, API_V1_PREFIX
from Db.session import get_db
from Db.session import engine, Base
import API.Models
Base.metadata.create_all(bind=engine)

from API.utils.config import APP_NAME, APP_DESCRIPTION, API_VERSION
from API.utils.exceptions import BaseAppException

# Import API routes
from API.routes import auth, users, projects, tasks, teams, comments, attachments, project_scopes, project_stakeholders, team_members, team_projects, chat
from API.routes import notifications  

app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(BaseAppException)
async def app_exception_handler(request: Request, exc: BaseAppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Root endpoint
@app.get("/")
def read_root():
    return {
        "app": APP_NAME,
        "version": API_VERSION,
        "status": "running",
        "docs": "/docs"
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
app.include_router(project_scopes.router, prefix=API_V1_PREFIX)
app.include_router(project_stakeholders.router, prefix=API_V1_PREFIX)
app.include_router(tasks.router, prefix=API_V1_PREFIX)
app.include_router(comments.router, prefix=API_V1_PREFIX)
app.include_router(attachments.router, prefix=API_V1_PREFIX)
app.include_router(teams.router, prefix=API_V1_PREFIX)
app.include_router(team_members.router, prefix=API_V1_PREFIX)
app.include_router(team_projects.router, prefix=API_V1_PREFIX)
app.include_router(chat.router, prefix=API_V1_PREFIX)
app.include_router(notifications.router, prefix=API_V1_PREFIX)

# Include WebSocket endpoints
# Note: WebSockets don't need the API_V1_PREFIX