import { useState, useEffect } from 'react';
import {
  Header,
  SpaceBetween,
  Container,
  Alert,
  Box,
} from '@cloudscape-design/components';
import CourseCard from '../components/CourseCard';
import { Course } from '../types';
import { studentService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Schedule = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentStudent } = useAuth();

  useEffect(() => {
    if (currentStudent) {
      fetchEnrolledCourses();
    }
  }, [currentStudent]);

  const fetchEnrolledCourses = async () => {
    if (!currentStudent) return;

    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getStudentCourses(currentStudent.id.toString());
      setEnrolledCourses(data.courses);
    } catch (err: any) {
      setError(err.message || 'Failed to load enrolled courses');
    } finally {
      setLoading(false);
    }
  };

  const totalCredits = enrolledCourses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="View and manage your enrolled courses"
      >
        My Schedule
      </Header>

      <Container>
        <SpaceBetween size="m">
          <Box>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Total Credits</Box>
              <Box fontSize="heading-l" fontWeight="bold">
                {totalCredits}
              </Box>
            </SpaceBetween>
          </Box>

          {error && (
            <Alert type="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {!loading && !error && enrolledCourses.length === 0 && (
            <Alert type="info">
              You are not enrolled in any courses yet. Visit the Course Catalog to browse and enroll.
            </Alert>
          )}

          <SpaceBetween size="m">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} enrolled />
            ))}
          </SpaceBetween>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
};

export default Schedule;
