from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CourseBase(BaseModel):
    code: str
    name: str
    description: str
    credits: int
    instructor: str
    schedule: str
    capacity: int
    prerequisites: Optional[List[str]] = None


class CourseCreate(CourseBase):
    pass


class Course(CourseBase):
    id: str
    enrolled: int = 0

    class Config:
        from_attributes = True


class StudentBase(BaseModel):
    name: str
    email: str
    major: str
    year: int


class StudentCreate(StudentBase):
    pass


class Student(StudentBase):
    id: str
    enrolled_courses: List[str] = []

    class Config:
        from_attributes = True


class EnrollmentBase(BaseModel):
    student_id: str
    course_id: str


class EnrollmentCreate(EnrollmentBase):
    pass


class Enrollment(EnrollmentBase):
    id: str
    enrollment_date: datetime
    status: str  # 'enrolled', 'waitlisted', 'dropped'

    class Config:
        from_attributes = True
