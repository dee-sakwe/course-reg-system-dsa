import { SpaceBetween, Box, Badge, ExpandableSection } from '@cloudscape-design/components';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  enrolled?: boolean;
}

// Repurposed this component to only be used for the schedule page
// It is now an expandable section that displays the course details
const CourseCard = ({ course }: CourseCardProps) => {
  const availableSeats = course.capacity - course.enrolled;
  const isFull = availableSeats <= 0;

  return (
    <ExpandableSection
      variant="container"
      headerText={`${course.code}: ${course.name}`}

    >
   
      <SpaceBetween size="l">
        <Box>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Instructor</Box>
            <div>{course.instructor}</div>
          </SpaceBetween>
        </Box>

        <Box>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Schedule</Box>
            <div>{course.schedule}</div>
          </SpaceBetween>
        </Box>

        <Box>
          <SpaceBetween size="xs">
            <Box variant="awsui-key-label">Description</Box>
            <div>{course.description}</div>
          </SpaceBetween>
        </Box>

        <SpaceBetween direction="horizontal" size="l">
          <Box>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Credits</Box>
              <Badge color="blue">{course.credits}</Badge>
            </SpaceBetween>
          </Box>

          <Box>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Availability</Box>
              <Badge color={isFull ? 'red' : 'green'}>
                {availableSeats} / {course.capacity} seats
              </Badge>
            </SpaceBetween>
          </Box>
        </SpaceBetween>

        {course.prerequisites && course.prerequisites.length > 0 && (
          <Box>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Prerequisites</Box>
              <SpaceBetween direction="horizontal" size="xs">
                {course.prerequisites.map((prereq) => (
                  <Badge key={prereq}>{prereq}</Badge>
                ))}
              </SpaceBetween>
            </SpaceBetween>
          </Box>
        )}
      </SpaceBetween>
    </ExpandableSection>
  );
};

export default CourseCard;
