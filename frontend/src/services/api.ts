import { Course, Student, Enrollment } from "../types";

const API_BASE_URL = "http://127.0.0.1:8000";

export const courseService = {
  // Simple in-memory cache with sessionStorage hydration
  _courseCache: null as null | { data: Course[]; fetchedAt: number },
  _COURSE_TTL_MS: 5 * 60 * 1000,

  _hydrateCache() {
    if (this._courseCache) return;
    try {
      const raw = sessionStorage.getItem("coursesCache");
      const ts = sessionStorage.getItem("coursesFetchedAt");
      if (raw && ts) {
        const data: Course[] = JSON.parse(raw);
        const fetchedAt = Number(ts);
        this._courseCache = { data, fetchedAt };
      }
    } catch {
      // ignore
    }
  },

  _isFresh(): boolean {
    if (!this._courseCache) return false;
    return Date.now() - this._courseCache.fetchedAt < this._COURSE_TTL_MS;
  },

  clearCourseCache() {
    this._courseCache = null;
    try {
      sessionStorage.removeItem("coursesCache");
      sessionStorage.removeItem("coursesFetchedAt");
    } catch {
      // ignore
    }
  },

  async getAllCoursesCached(options?: { forceRefresh?: boolean }): Promise<Course[]> {
    this._hydrateCache();
    const forceRefresh = options?.forceRefresh === true;
    if (!forceRefresh && this._isFresh() && this._courseCache) {
      return this._courseCache.data;
    }
    const data = await this.getAllCourses();
    this._courseCache = { data, fetchedAt: Date.now() };
    try {
      sessionStorage.setItem("coursesCache", JSON.stringify(data));
      sessionStorage.setItem("coursesFetchedAt", String(this._courseCache.fetchedAt));
    } catch {
      // ignore storage errors
    }
    return data;
  },

  async getAllCourses(): Promise<Course[]> {
    const response = await fetch(`${API_BASE_URL}/courses`);
    if (!response.ok) throw new Error("Failed to fetch courses");
    return response.json();
  },

  async getCourseById(id: string): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    if (!response.ok) throw new Error("Failed to fetch course");
    return response.json();
  },

  async searchCourses(query: string): Promise<Course[]> {
    const response = await fetch(
      `${API_BASE_URL}/courses/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error("Failed to search courses");
    return response.json();
  },
};

export const studentService = {
  async getStudent(id: string): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/students/${id}`);
    if (!response.ok) throw new Error("Failed to fetch student");
    return response.json();
  },

  async getStudentCourses(id: string): Promise<{ student: string; courses: Course[]; enrollments: Enrollment[] }> {
    const response = await fetch(`${API_BASE_URL}/students/${id}/courses`);
    if (!response.ok) throw new Error("Failed to fetch student courses");
    return response.json();
  },

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update student");
    const result = await response.json();
    return result.student;
  },
};

export const enrollmentService = {
  async enrollInCourse(
    studentId: string,
    courseId: string
  ): Promise<Enrollment> {
    const response = await fetch(`${API_BASE_URL}/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId, course_id: courseId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to enroll in course");
    }
    const result = await response.json();
    return result.enrollment;
  },

  async dropCourse(enrollmentId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/enrollments/${enrollmentId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to drop course");
  },
};

export const authService = {
  async login(studentId: string, password: string): Promise<{ message: string; student?: Student }> {
    const response = await fetch(`${API_BASE_URL}/login_students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }
    
    // Fetch full student data after successful login
    // Get all students and find the one with matching student_id
    const studentResponse = await fetch(`${API_BASE_URL}/students`);
    if (!studentResponse.ok) {
      throw new Error("Failed to fetch student data");
    }
    const students = await studentResponse.json();
    const student = students.find((s: any) => s.student_id === studentId);
    
    if (!student) {
      throw new Error("Student data not found");
    }
    
    return { message: data.message, student };
  },

  async register(
    studentId: string,
    name: string,
    email: string,
    major: string,
    year: number,
    password: string
  ): Promise<{ message: string; student: Student }> {
    const response = await fetch(`${API_BASE_URL}/register_students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: studentId,
        name,
        email,
        major,
        year,
        password,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }
    
    return data;
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/logout_students`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Logout failed");
  },
};
