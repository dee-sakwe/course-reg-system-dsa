from flask_sqlalchemy import SQLAlchemy
from datetime import timezone, datetime

db = SQLAlchemy()

# Association table for self-referential many-to-many prerequisites
course_prerequisites = db.Table(
    'course_prerequisites',
    db.Column('course_id', db.Integer, db.ForeignKey('courses.id'), primary_key=True),
    db.Column('prereq_id', db.Integer, db.ForeignKey('courses.id'), primary_key=True)
)

class Student(db.Model):
    __tablename__ = "students"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(15), nullable=False) 
    student_name = db.Column(db.String(100), nullable=False)
    student_email = db.Column(db.String(100), nullable=False)
    major = db.Column(db.String(100), nullable=True)
    year = db.Column(db.Integer, nullable=True)
    password = db.Column(db.String(200), nullable=True)


    def __init__(self, student_id, student_name, student_email, major, year, password):
        self.student_id = student_id
        self.student_name = student_name
        self.student_email = student_email
        self.major = major
        self.year = year
        self.password = password

    def __repr__(self):
        return self.student_id
    def json(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'name': self.student_name,
            'email' : self.student_email,
            'major' : self.major,
            'year' : self.year,
            'password': self.password
        }

class Course(db.Model):
    __tablename__ = "courses"
    id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.String(100), nullable=False)
    course_code = db.Column(db.String(10), nullable=False) 
    instructor = db.Column(db.String(100), nullable=False)
    max_students = db.Column(db.Integer, default=30)
    description = db.Column(db.String(500), nullable=False)
    course_credits = db.Column(db.Integer, default=1)
    schedule = db.Column(db.String, nullable=False)

    # self-referential many-to-many relationship: a course can have many prerequisites
    prerequisites = db.relationship(
        'Course',
        secondary=course_prerequisites,
        primaryjoin=id == course_prerequisites.c.course_id,
        secondaryjoin=id == course_prerequisites.c.prereq_id,
        backref='dependent_courses'
    )

    def json(self):
        return {
            'id': self.id,
            'name': self.course_name,
            'code': self.course_code,
            'instructor': self.instructor,
            'capacity': self.max_students,
            'description': self.description,
            'credits': self.course_credits,
            'schedule': self.schedule,
            'enrolled': len(self.enrollments),
            # return prerequisites as an array of course codes for front-end friendly display
            'prerequisites': [p.course_code for p in self.prerequisites]
        }

class Enrollment(db.Model):
    __tablename__ = "enrollments"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    enrolled_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    semester = db.Column(db.String(20))
    # status: 'enrolled', 'completed', 'dropped', 'waitlisted'
    status = db.Column(db.String(20), default='enrolled')
    completed_date = db.Column(db.DateTime, nullable=True)
    
    student = db.relationship('Student', backref='enrollments')
    course = db.relationship('Course', backref='enrollments')
    
    def json(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'course_id': self.course_id,
            'course_name': self.course.course_name,
            'course_code': self.course.course_code,
            'enrolled_date': self.enrolled_date.isoformat() if self.enrolled_date else None,
            'semester': self.semester,
            'status': self.status,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
        }

    
