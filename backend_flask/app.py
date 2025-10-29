from flask import Flask, request, jsonify, make_response
from models import db, Student, Course, Enrollment
from sqlalchemy import or_
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
from flask_cors import CORS
import flask_login


# Load local .env in development (no-op if not present)
load_dotenv()

# Initialize app
EnrollmentSystem = Flask(__name__)

# Enable Cors
CORS(EnrollmentSystem)

# Get Postgres URL from either DB_URL or DATABASE_URL
db_url = os.environ.get('DB_URL')
if not db_url:
    raise RuntimeError("DB_URL (or DATABASE_URL) environment variable is not set.")
    

EnrollmentSystem.config['SQLALCHEMY_DATABASE_URI'] = db_url
EnrollmentSystem.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure app to postgres
db.init_app(EnrollmentSystem)

# Create all tables in models.py (fail fast with clear error)
with EnrollmentSystem.app_context():
    try:
        db.create_all()
    except Exception as e:
        raise RuntimeError(f"Failed to create DB tables: {e}") from e

login_manager = flask_login.LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(EnrollmentSystem)


@login_manager.user_loader
def load_user(student_id):
    return Student.query.get(student_id)


@EnrollmentSystem.route('/students', methods=['GET'])
def get_students():
    """Get all students in the system"""
    try:
        students = Student.query.all()
        return make_response(jsonify([student.json() for student in students]), 200)
    except Exception as e:
        return make_response(jsonify({'message': 'error getting students', 'error': str(e)}), 500)

@EnrollmentSystem.route('/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    """Query the database to get a a student by student_id"""
    try:
        student = Student.query.get_or_404(student_id)
        return make_response(jsonify(student.json()))
    except:
        return make_response(jsonify({'message': 'Could not find Student in Database'}), 409)

@EnrollmentSystem.route('/students/<int:student_id>', methods=['PATCH'])
def update_student(student_id):
    """Update student information in the database"""
    try:
        student = Student.query.get_or_404(student_id)
        data = request.get_json()

        # Update only provided fields
        if 'id' in data:
            student.student_id = data['id']
        elif 'student_id' in data:
            student.student_id = data['student_id']
        if 'name' in data:
            student.student_name = data['name']
        if 'email' in data:
            student.student_email = data['email']
        if 'major' in data:
            student.major = data['major']
        if 'year' in data:
            student.year = data['year']

        db.session.commit()
        return make_response(jsonify({
            'message': 'student updated successfully',
            'student': student.json()
        }), 200)

    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({
            'message': 'error updating student',
            'error': str(e)
        }), 500)

@EnrollmentSystem.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete student data from the database"""
    try:
        student = Student.query.get_or_404(student_id)
        db.session.delete(student)
        db.session.commit()
        return make_response(jsonify({'message': 'student data deleted successfully'}), 200)
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({'message': 'error deleting student', 'error': str(e)}), 500)
    
@EnrollmentSystem.route('/students/<int:student_id>/courses', methods=['GET'])
def get_student_courses(student_id):
    """Get all courses for a specific student"""
    try:
        student = Student.query.get_or_404(student_id)
        # Return full course objects for each enrollment so clients get the canonical Course shape
        courses = [enrollment.course.json() for enrollment in student.enrollments]
        enrollments_meta = [enrollment.json() for enrollment in student.enrollments]
        return make_response(jsonify({
            'student': student.student_name,
            'courses': courses,
            'enrollments': enrollments_meta
        }), 200)
    except Exception as e:
        return make_response(jsonify({'message': 'error getting students in this course', 'error': str(e)}), 500)

@EnrollmentSystem.route('/courses', methods=['GET'])
def get_courses():
    """Get all courses in the database"""
    try:
        courses = Course.query.all()
        return make_response(jsonify([course.json() for course in courses]), 200)
    except Exception as e:
        return make_response(jsonify({'message': 'error getting courses', 'error': str(e)}), 500)


@EnrollmentSystem.route('/courses/search', methods=['GET'])
def search_courses():
    """Search courses by query string across name, code, description, instructor."""
    try:
        data = request.get_json()
        q = data.get('q', '')
        q = (q or '').strip()
        if q == '':
            # no query — return all courses
            courses = Course.query.all()
        else:
            pattern = f"%{q}%"
            courses = Course.query.filter(or_(
                Course.course_name.ilike(pattern),
                Course.course_code.ilike(pattern),
                Course.instructor.ilike(pattern),
            )).all()

        return make_response(jsonify([course.json() for course in courses]), 200)
    except Exception as e:
        return make_response(jsonify({'message': 'error searching courses', 'error': str(e)}), 500)

@EnrollmentSystem.route('/courses', methods=['POST'])
def create_course():
    """Adds a new course to the database"""
    try:
        data = request.get_json()
        # construct using the actual column names from models.Course
        new_course = Course(
            course_name=data['name'],
            course_code=data['code'],
            instructor=data.get('instructor', ''),
            max_students=data.get('capacity', 30),
            description=data.get('description', ''),
            course_credits=data.get('credits', 1),
            schedule=data.get('schedule', '')
        )
        # attach prerequisites if provided (expecting list of course IDs)
        prereq_ids = data.get('prerequisites') or []
        if isinstance(prereq_ids, list) and prereq_ids:
            resolved = []
            for pid in prereq_ids:
                try:
                    pid_int = int(pid)
                except Exception:
                    continue
                p = Course.query.get(pid_int)
                if p:
                    resolved.append(p)
            if resolved:
                new_course.prerequisites = resolved
        db.session.add(new_course)
        db.session.commit()
        return make_response(jsonify({'message': 'course created', 'course': new_course.json()}), 201)
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({'message': 'error creating course', 'error': str(e)}), 500)
    
@EnrollmentSystem.route('/enrollments', methods=['POST'])
def enroll_student():
    """Register a student for a course"""
    try:
        data = request.get_json()
        # Accept a DB PK or external identifier (be forgiving about types)
        raw_student = data.get('student_id') or data.get('student') or data.get('studentId')
        raw_course = data.get('course_id') or data.get('course') or data.get('courseId')

        if raw_student is None or raw_course is None:
            return make_response(jsonify({'message': 'student_id and course_id are required'}), 400)

        # resolve student: try primary key then external student_id
        student = None
        try:
            sid = int(raw_student)
            student = Student.query.get(sid)
        except Exception:
            pass
        if not student:
            student = Student.query.filter_by(student_id=str(raw_student)).first()
        if not student:
            return make_response(jsonify({'message': 'student not found'}), 404)

        # resolve course: try primary key then course_code
        course = None
        try:
            cid = int(raw_course)
            course = Course.query.get(cid)
        except Exception:
            pass
        if not course:
            course = Course.query.filter_by(course_code=str(raw_course)).first()
        if not course:
            return make_response(jsonify({'message': 'course not found'}), 404)
        
        # Check prerequisites: student must have completed all prerequisite courses
        missing = []
        for prereq in course.prerequisites:
            completed = Enrollment.query.filter_by(
                student_id=student.id,
                course_id=prereq.id,
                status='completed'
            ).first()
            if not completed:
                missing.append(prereq.course_name)
        if missing:
            return make_response(jsonify({'message': 'missing prerequisites', 'missing': missing}), 400)

        # Check if already enrolled
        existing_enrollment = Enrollment.query.filter_by(
            student_id=student.id,
            course_id=course.id,
        ).first()
        
        if existing_enrollment:
            return make_response(jsonify({'message': 'student already enrolled in this course'}), 400)
        
        # Check if course is full (count only currently enrolled students)
        active_enrollments = Enrollment.query.filter_by(course_id=course.id, status='enrolled').count()
        if active_enrollments >= course.max_students:
            return make_response(jsonify({'message': 'course is full'}), 400)
        
        # Create enrollment
        new_enrollment = Enrollment(
            student_id=student.id,
            course_id=course.id,
            semester=data.get('semester')
        )
        
        db.session.add(new_enrollment)
        db.session.commit()
        
        return make_response(jsonify({
            'message': 'student enrolled successfully',
            'enrollment': new_enrollment.json()
        }), 201)
        
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({'message': 'error enrolling student', 'error': str(e)}), 500)


@EnrollmentSystem.route('/enrollments/<int:enrollment_id>/status', methods=['PATCH'])
def update_enrollment_status(enrollment_id):
    """Update the status of an enrollment (e.g., mark completed)"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        if new_status not in ('enrolled', 'completed', 'dropped', 'waitlisted'):
            return make_response(jsonify({'message': 'invalid status'}), 400)

        enrollment = Enrollment.query.get_or_404(enrollment_id)
        enrollment.status = new_status
        if new_status == 'completed':
            enrollment.completed_date = datetime.now(timezone.utc)
        else:
            enrollment.completed_date = None

        db.session.commit()
        return make_response(jsonify({'message': 'status updated', 'enrollment': enrollment.json()}), 200)
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({'message': 'error updating status', 'error': str(e)}), 500)

@EnrollmentSystem.route('/enrollments/<int:enrollment_id>', methods=['DELETE'])
def drop_course(enrollment_id):
    """Drop a course (delete enrollment)"""
    try:
        enrollment = Enrollment.query.get_or_404(enrollment_id)
        db.session.delete(enrollment)
        db.session.commit()
        return make_response(jsonify({'message': 'course dropped successfully'}), 200)
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({'message': 'error dropping course', 'error': str(e)}), 500)

@EnrollmentSystem.route('/courses/<int:course_id>/students', methods=['GET'])
def get_course_students(course_id):
    """Get all students enrolled in a specific course"""
    try:
        course = Course.query.get_or_404(course_id)
        students = [{
            'student_id': enrollment.student.student_id,
            'name': enrollment.student.student_name
        } for enrollment in course.enrollments]
        
        return make_response(jsonify({
            'course': course.course_name,
            'students': students,
            'total_enrolled': len(students)
        }), 200)
    except Exception as e:
        return make_response(jsonify({'message': 'error getting course students', 'error': str(e)}), 500)

# Login, Register, Logout
@EnrollmentSystem.route('/register_students', methods = ['POST'])
def register_student():
    """Adds a new student to the database"""
    try:
        data = request.get_json()
        # Accept either 'student_id' or 'id' for the external identifier (backwards-compatible)
        student_identifier = data.get('student_id') or data.get('id')
        if not student_identifier:
            return make_response(jsonify({'message': "student_id (or id) is required"}), 400)
        # check for existing student by the external identifier
        existing = Student.query.filter_by(student_id=student_identifier).first()
        if existing:
            return make_response(jsonify({'message': 'Student with this ID already created'}), 409)

        # Create a Student using the model's constructor (no password field present in model)
        new_student = Student(
            student_identifier,
            data.get('name', ""),
            data.get('email', ""),
            data.get('major', ""),
            data.get('year', 2025),
            data.get('password')
        )
        db.session.add(new_student)
        db.session.commit()
        return make_response(jsonify({'message': 'student created', 'student': new_student.json()}), 201)
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({'message': 'error creating student', 'error': str(e)}), 500)

@EnrollmentSystem.route('/login_students', methods=['POST'])
def login_student():
    """Creates a session for a student"""
    data = request.get_json()
    student_identifier = data.get('student_id') or data.get('id')
    password = data['password']
    # resolve student by external identifier
    cur_student = Student.query.filter_by(student_id=student_identifier).first()
    if not cur_student:
        return make_response({'message': 'Student with this ID does not exist'}, 404)
    if cur_student.password == password:
        return make_response({'message': 'Student Logged in'}, 201)
    return make_response({'message': 'Wrong Password for Student'}, 400)

@EnrollmentSystem.route('/logout_students', methods=['POST'])
def logout_student():
    """Logs a student out of their session"""
    flask_login.logout_user()
    return make_response({'message': 'Successfully Logged Out'})
    
if __name__ == '__main__':
    EnrollmentSystem.run(debug=True, port=8000)