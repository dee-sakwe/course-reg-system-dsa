from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Course, CourseCreate

router = APIRouter(prefix="/courses", tags=["courses"])

# Temporary in-memory storage (will be replaced with database)
courses_db: List[Course] = []


@router.get("/", response_model=List[Course])
async def get_all_courses():
    """Get all available courses."""
    return courses_db


@router.get("/{course_id}", response_model=Course)
async def get_course(course_id: str):
    """Get a specific course by ID."""
    course = next((c for c in courses_db if c.id == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/search/", response_model=List[Course])
async def search_courses(q: str):
    """Search courses by name, code, or instructor."""
    query = q.lower()
    results = [
        course
        for course in courses_db
        if query in course.name.lower()
        or query in course.code.lower()
        or query in course.instructor.lower()
    ]
    return results


@router.post("/", response_model=Course, status_code=201)
async def create_course(course: CourseCreate):
    """Create a new course."""
    # Generate a simple ID (in production, use UUID or database auto-increment)
    course_id = str(len(courses_db) + 1)
    new_course = Course(id=course_id, **course.model_dump(), enrolled=0)
    courses_db.append(new_course)
    return new_course
