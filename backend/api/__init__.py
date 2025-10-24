"""
API package initialization.
This module contains API routes for the course registration system.
"""

from .courses import router as courses_router
from .students import router as students_router
from .enrollments import router as enrollments_router

__all__ = ["courses_router", "students_router", "enrollments_router"]
