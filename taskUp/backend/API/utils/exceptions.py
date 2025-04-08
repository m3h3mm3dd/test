from fastapi import HTTPException, status
from typing import Optional, Dict, Any

class BaseAppException(HTTPException):
    """Base application exception"""
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class ResourceNotFoundException(BaseAppException):
    """Exception for resource not found"""
    def __init__(self, resource_type: str, resource_id: str):
        detail = f"{resource_type} with ID {resource_id} not found"
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class NotAuthorizedException(BaseAppException):
    """Exception for unauthorized access"""
    def __init__(self, detail: str = "You are not authorized to perform this action"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )

class ValidationException(BaseAppException):
    """Exception for validation errors"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )

class ConflictException(BaseAppException):
    """Exception for resource conflicts"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )