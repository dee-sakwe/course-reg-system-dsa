from flask_sqlalchemy import SQLAlchemy
from datetime import timezone, datetime

db = SQLAlchemy()


class Student(db.Model):
    __tablename__ = "students"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(15), nullable=False)  # Compulsory
    student_name = db.Column(db.String(100), nullable=True)

    def __init__(self, student_id, student_name):
        self.student_id = student_id
        self.student_name = student_name

    def json(self):
        return {
            "id": self.id,
            "student_name": self.student_name,
            "student_id": self.student_id,
        }


class Course(db.Model):
    __tablename__ = "courses"
    id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.String(100), nullable=False)
    course_code = db.Column(db.String(10), nullable=False)
    instructor_name = db.Column(db.String(100), nullable=False)
    max_students = db.Column(db.Integer, default=30)

    def json(self):
        return {
            "id": self.id,
            "course_name": self.course_name,
            "course_code": self.course_code,
            "instructor_name": self.instructor_name,
            "max_students": self.max_students,
        }


class Enrollment(db.Model):
    __tablename__ = "enrollments"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)

    enrolled_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    semester = db.Column(db.String(20))

    student = db.relationship("Student", backref="enrollments")
    course = db.relationship("Course", backref="enrollments")

    def json(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "course_id": self.course_id,
            "course_name": self.course.course_name,
            "course_code": self.course.course_code,
            "enrolled_date": self.enrolled_date.isoformat()
            if self.enrolled_date
            else None,
            "semester": self.semester,
        }
