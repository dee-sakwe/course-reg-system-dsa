import { useState } from 'react';
import {
  Header,
  SpaceBetween,
  Container,
  Alert,
  Box,
} from '@cloudscape-design/components';
import CourseCard from '../components/CourseCard';
import { Course } from '../types';

const Schedule = () => {
  const [enrolledCourses] = useState<Course[]>([]);
  const [loading] = useState(false);

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

          {!loading && enrolledCourses.length === 0 && (
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
