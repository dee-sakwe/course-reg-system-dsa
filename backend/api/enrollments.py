from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Enrollment, EnrollmentCreate
from datetime import datetime

router = APIRouter(prefix="/enrollments", tags=["enrollments"])

# Temporary in-memory storage (will be replaced with database)
enrollments_db: List[Enrollment] = []


@router.post("/", response_model=Enrollment, status_code=201)
async def enroll_in_course(enrollment: EnrollmentCreate):
    """Enroll a student in a course."""
    # Check if already enrolled
    existing = next(
        (
            e
            for e in enrollments_db
            if e.student_id == enrollment.student_id
            and e.course_id == enrollment.course_id
            and e.status == "enrolled"
        ),
        None,
    )
    if existing:
        raise HTTPException(
            status_code=400, detail="Student already enrolled in this course"
        )

    enrollment_id = str(len(enrollments_db) + 1)
    new_enrollment = Enrollment(
        id=enrollment_id,
        student_id=enrollment.student_id,
        course_id=enrollment.course_id,
        enrollment_date=datetime.now(),
        status="enrolled",
    )
    enrollments_db.append(new_enrollment)
    return new_enrollment


@router.delete("/{enrollment_id}", status_code=204)
async def drop_course(enrollment_id: str):
    """Drop a course enrollment."""
    enrollment = next((e for e in enrollments_db if e.id == enrollment_id), None)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    enrollment.status = "dropped"
    return None
