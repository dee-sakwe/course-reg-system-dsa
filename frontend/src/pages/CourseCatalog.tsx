import { useState } from 'react';
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

const CourseCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses] = useState<Course[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const handleSearch = () => {
    // Search functionality will be implemented when backend is ready
    console.log('Searching for:', searchQuery);
  };

  const handleEnroll = (courseId: string) => {
    // Enrollment functionality will be implemented when backend is ready
    console.log('Enrolling in course:', courseId);
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              value={searchQuery}
              onChange={({ detail }) => setSearchQuery(detail.value)}
              placeholder="Search courses by name, code, or instructor..."
              type="search"
              style={{ flexGrow: 1 }}
            />
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
