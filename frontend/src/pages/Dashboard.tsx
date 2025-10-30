import { useState, useEffect } from 'react';
import { Container, Header, SpaceBetween, Box, ColumnLayout, Link} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseService, studentService } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentStudent } = useAuth();
  const [totalCourses, setTotalCourses] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  
  useEffect(() => {
    fetchDashboardData();
  }, [currentStudent]);

  const fetchDashboardData = async () => {
    try {
      // Fetch total courses available
      const courses = await courseService.getAllCourses();
      setTotalCourses(courses.length);

      // Fetch enrolled courses for the current student
      if (currentStudent) {
        const data = await studentService.getStudentCourses(currentStudent.id.toString());
        setEnrolledCount(data.courses.length);
        const credits = data.courses.reduce((sum, course) => sum + course.credits, 0);
        setTotalCredits(credits);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  return (
    <SpaceBetween size="l">
      <Header variant="h1">Welcome to your Dashboard, {currentStudent?.name}!</Header>

      <Container>
        <ColumnLayout columns={3} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Total Courses</Box>
            <Box fontSize="heading-xl" fontWeight="bold">
              {totalCourses}
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Enrolled Courses</Box>
            <Box fontSize="heading-xl" fontWeight="bold">
              {enrolledCount}
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Total Credits</Box>
            <Box fontSize="heading-xl" fontWeight="bold">
              {totalCredits}
            </Box>
          </div>
        </ColumnLayout>
      </Container>

      <Container header={<Header variant="h2">Quick Actions</Header>}>
        <SpaceBetween size="m">
          <Link onFollow={() => navigate('/courses')}>Browse the course catalog to find courses for the upcoming semester</Link>
          <Link onFollow={() => navigate('/schedule')}>View and manage your current course schedule</Link>
          <Link onFollow={() => navigate('/profile')}>Update your student profile and preferences</Link>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
};

export default Dashboard;
