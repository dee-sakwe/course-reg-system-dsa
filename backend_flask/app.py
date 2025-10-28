from flask import Flask, request, jsonify, make_response
from models import db, Student, Course, Enrollment
import os
from dotenv import load_dotenv

# Load local .env in development (no-op if not present)
load_dotenv()

# Initialize app
EnrollmentSystem = Flask(__name__)

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

@EnrollmentSystem.route('/students', methods=['GET'])
def get_students():
    """Get all students in the system"""
    try:
        students = Student.query.all()
        return make_response(jsonify([student.json() for student in students]), 200)
    except Exception as e:
        return make_response(jsonify({'message': 'error getting students', 'error': str(e)}), 500)

@EnrollmentSystem.route('/students', methods = ['POST'])
def create_student():
    """Adds a new student to the database"""
    try:
        data = request.get_json()
        new_student = Student(data['student_id'], data.get('student_name', "")) # .get() optional parameter
        db.session.add(new_student)
        db.session.commit()
        return make_response(jsonify({'message': 'student created'}), 201)
    except:
        db.session.rollback()
        return make_response(jsonify({'message': 'error creating student'}), 500)

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
        if 'student_id' in data:
            student.student_id = data['student_id']
        if 'student_name' in data:
            student.student_name = data['student_name']

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
        enrollments = [enrollment.json() for enrollment in student.enrollments]
        return make_response(jsonify({
            'student': student.name,
            'courses': enrollments
        }), 200)
    except Exception as e:
        return make_response(jsonify({'message': 'error getting student courses', 'error': str(e)}), 500)

@EnrollmentSystem.route('/courses', methods=['GET'])
def get_courses():
    """Get all courses in the database"""
    try:
        courses = Course.query.all()
        return make_response(jsonify([course.json() for course in courses]), 200)
    except Exception as e:
        return make_response(jsonify({'message': 'error getting courses', 'error': str(e)}), 500)

@EnrollmentSystem.route('/courses', methods=['POST'])
def create_course():
    """Adds a new course to the database"""
    try:
        data = request.get_json()
        new_course = Course(
            course_name=data['course_name'],
            course_code=data['course_code'],
            instructor_name=data['instructor_name'],
            max_students=data.get('max_students', 30)
        )
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
        student_id = data['student_id']
        course_id = data['course_id']
        
        # Check if student exists
        student = Student.query.get(student_id)
        if not student:
            return make_response(jsonify({'message': 'student not found'}), 404)
        
        # Check if course exists
        course = Course.query.get(course_id)
        if not course:
            return make_response(jsonify({'message': 'course not found'}), 404)
        
        # Check if already enrolled
        existing_enrollment = Enrollment.query.filter_by(
            student_id=student_id, 
            course_id=course_id
        ).first()
        
        if existing_enrollment:
            return make_response(jsonify({'message': 'student already enrolled in this course'}), 400)
        
        # Check if course is full
        active_enrollments = Enrollment.query.filter_by(course_id=course_id).count()
        if active_enrollments >= course.max_students:
            return make_response(jsonify({'message': 'course is full'}), 400)
        
        # Create enrollment
        new_enrollment = Enrollment(
            student_id=student_id,
            course_id=course_id,
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
            'name': enrollment.student.name
        } for enrollment in course.enrollments]
        
        return make_response(jsonify({
            'course': course.course_name,
            'students': students,
            'total_enrolled': len(students)
        }), 200)
    except Exception as e:
        return make_response(jsonify({'message': 'error getting course students', 'error': str(e)}), 500)


if __name__ == '__main__':
    EnrollmentSystem.run(debug=True)