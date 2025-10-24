import { Course, Student, Enrollment } from '../types';

const API_BASE_URL = '/api';

export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    const response = await fetch(`${API_BASE_URL}/courses`);
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },

  async getCourseById(id: string): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    if (!response.ok) throw new Error('Failed to fetch course');
    return response.json();
  },

  async searchCourses(query: string): Promise<Course[]> {
    const response = await fetch(`${API_BASE_URL}/courses/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search courses');
    return response.json();
  },
};

export const studentService = {
  async getStudent(id: string): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/students/${id}`);
    if (!response.ok) throw new Error('Failed to fetch student');
    return response.json();
  },

  async getStudentSchedule(id: string): Promise<Course[]> {
    const response = await fetch(`${API_BASE_URL}/students/${id}/schedule`);
    if (!response.ok) throw new Error('Failed to fetch schedule');
    return response.json();
  },
};

export const enrollmentService = {
  async enrollInCourse(studentId: string, courseId: string): Promise<Enrollment> {
    const response = await fetch(`${API_BASE_URL}/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, courseId }),
    });
    if (!response.ok) throw new Error('Failed to enroll in course');
    return response.json();
  },

  async dropCourse(enrollmentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to drop course');
  },
};
