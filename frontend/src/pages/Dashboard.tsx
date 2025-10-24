import { Container, Header, SpaceBetween, Box, ColumnLayout } from '@cloudscape-design/components';

const Dashboard = () => {
  return (
    <SpaceBetween size="l">
      <Header variant="h1">Dashboard</Header>

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
          <Box>Browse the course catalog to find courses for the upcoming semester</Box>
          <Box>View and manage your current course schedule</Box>
          <Box>Update your student profile and preferences</Box>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
};

export default Dashboard;
