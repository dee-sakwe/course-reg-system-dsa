## Available API Endpoints:

- 'http://127.0.0.1:8000/students'
  Requests allowed:

  - GET: gets all students
  - POST: adds a new student

- http://127.0.0.1:8000/students/:student_id
  Requests allowed:

  - GET: a particular student's info
  - PATCH: update a student by id
  - DELETE: delete a student

- http://127.0.0.1:8000/courses

  - GET: gets all courses
  - POST: creates a new course

- http://127.0.0.1:8000/courses/:course_id/students

  - GET: gets all students enrolled in a course

- http://127.0.0.1:8000/students/:student_id/courses
  Requests allowed:

  - GET: Gets all courses for a student

- http://127.0.0.1:8000/enrollments
  Requests allowed:

  - POST: register a student for a course

- http://127.0.0.1:8000/enrollments/enrollment_id
  Requests allowed:

  - DELETE: drop a course for a student

- Search Courses
- Search Students

Let me know if any other endpoints are required.
