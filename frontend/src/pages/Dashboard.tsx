import { Container, Header, SpaceBetween, Box, ColumnLayout, Link} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentStudent } = useAuth();
  
  return (
    <SpaceBetween size="l">
      <Header variant="h1">Welcome to your Dashboard, {currentStudent?.name}!</Header>

      <Container>
        <ColumnLayout columns={3} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Total Courses</Box>
            <Box fontSize="heading-xl" fontWeight="bold">
              0
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Enrolled Courses</Box>
            <Box fontSize="heading-xl" fontWeight="bold">
              0
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Total Credits</Box>
            <Box fontSize="heading-xl" fontWeight="bold">
              0
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
