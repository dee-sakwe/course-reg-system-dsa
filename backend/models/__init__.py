"""
Models package initialization.
This module contains data models and schemas for the course registration system.
"""

from .schemas import (
    Course,
    CourseBase,
    CourseCreate,
    Student,
    StudentBase,
    StudentCreate,
    Enrollment,
    EnrollmentBase,
    EnrollmentCreate,
)

__all__ = [
    "Course",
    "CourseBase",
    "CourseCreate",
    "Student",
    "StudentBase",
    "StudentCreate",
    "Enrollment",
    "EnrollmentBase",
    "EnrollmentCreate",
]
