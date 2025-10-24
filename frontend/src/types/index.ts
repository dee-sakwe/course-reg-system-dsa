export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  instructor: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  prerequisites?: string[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  major: string;
  year: number;
  enrolledCourses: string[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  status: 'enrolled' | 'waitlisted' | 'dropped';
}

export interface Schedule {
  studentId: string;
  courses: Course[];
  totalCredits: number;
}
