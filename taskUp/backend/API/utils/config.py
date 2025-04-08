import os
from pathlib import Path

# Base project directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

# API Version
API_VERSION = "1.0.0"

# Application config
APP_NAME = "TaskUp API"
APP_DESCRIPTION = "TaskUp - Project and Task Management API"

# File storage settings
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)