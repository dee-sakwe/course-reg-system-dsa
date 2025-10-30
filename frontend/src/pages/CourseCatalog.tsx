import { useState, useEffect } from 'react';
import {
  Header,
  SpaceBetween,
  Input,
  Button,
  Container,
  Alert,
} from '@cloudscape-design/components';
import CourseCard from '../components/CourseCard';
import { Course } from '../types';
import { courseService, enrollmentService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CourseCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentStudent } = useAuth();

  // Fetch all courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCourses();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await courseService.searchCourses(searchQuery);
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!currentStudent) {
      setError('You must be logged in to enroll in courses');
      return;
    }

    setError(null);
    try {
      await enrollmentService.enrollInCourse(
        currentStudent.id.toString(),
        courseId
      );
      alert('Successfully enrolled in course!');
      // Refresh courses to update enrollment counts
      fetchCourses();
    } catch (err: any) {
      setError(err.message || 'Failed to enroll in course');
    }
  };

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Browse and search for available courses"
      >
        Course Catalog
      </Header>

      <Container>
        <SpaceBetween size="m">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ flexGrow: 1 }}>
              <Input
                value={searchQuery}
                onChange={({ detail }) => setSearchQuery(detail.value)}
                placeholder="Search courses by name, code, or instructor..."
                type="search"
              />
            </div>
            <Button onClick={handleSearch} variant="primary" loading={loading}>
              Search
            </Button>
          </div>

          {error && (
            <Alert type="error" dismissible>
              {error}
            </Alert>
          )}

          {courses.length === 0 && !loading && (
            <Alert type="info">
              No courses available. The course catalog will be populated when the backend is connected.
            </Alert>
          )}

          <SpaceBetween size="m">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
              />
            ))}
          </SpaceBetween>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
};

export default CourseCatalog;
