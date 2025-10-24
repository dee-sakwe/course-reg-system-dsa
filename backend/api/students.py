from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Student, StudentCreate, Course

router = APIRouter(prefix="/students", tags=["students"])

# Temporary in-memory storage (will be replaced with database)
students_db: List[Student] = []


@router.get("/{student_id}", response_model=Student)
async def get_student(student_id: str):
    """Get a student by ID."""
    student = next((s for s in students_db if s.id == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.get("/{student_id}/schedule", response_model=List[Course])
async def get_student_schedule(student_id: str):
    """Get a student's enrolled courses."""
    student = next((s for s in students_db if s.id == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # This will be replaced with actual database queries
    # For now, return empty list
    return []


@router.post("/", response_model=Student, status_code=201)
async def create_student(student: StudentCreate):
    """Create a new student."""
    student_id = str(len(students_db) + 1)
    new_student = Student(id=student_id, **student.model_dump())
    students_db.append(new_student)
    return new_student
