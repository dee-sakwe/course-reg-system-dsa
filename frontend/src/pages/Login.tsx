import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  Form,
  FormField,
  Input,
  Link,
  Button,
  SpaceBetween,
  Alert,
  TopNavigation,
  AppLayout,
  Box,
} from '@cloudscape-design/components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Login = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setError(null);

    // Validate fields
    if (!studentId.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const success = await login(studentId, password);
      
      if (success) {
        navigate('/');
      } else {
        setError('Invalid student ID or password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNavigation
        identity={{
          href: '#',
          title: 'Grambling State University',
          logo: {
            src: '/images/Grambling_State_Tigers_logo.svg',
            alt: 'Grambling State University Logo',
          }
        }}
        utilities={[
            {
                type: 'button',
                variant: 'primary-button',
                text: isDarkMode ? 'Dark mode' : 'Light mode',
                iconUrl: isDarkMode ? '/images/dark_mode_moon_black.svg' : '/images/light_mode_sun_black.svg',
                iconAlt: 'Toggle Theme',
                title: isDarkMode ? 'Switch to light mode' : 'Switch to dark mode',
                onClick: toggleTheme,
                disableUtilityCollapse: true,
              },
        ]}
      />
      <AppLayout
        content={
          <div style={{ 
            minHeight: '80vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px'
          }}>
            <Container>
              <form onSubmit={handleSubmit}>
                <Form
                  actions={
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button 
                        formAction="none" 
                        variant="link"
                        onClick={() => {
                          setStudentId('');
                          setPassword('');
                          setError(null);
                          setAttemptedSubmit(false);
                        }
                      }>
                        Clear
                      </Button>
                      <Button 
                        variant="primary"
                        loading={loading}
                      >
                        {loading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </SpaceBetween>
                  }
                  header={
                    <Header
                      variant="h1"
                      description="Enter your credentials to access the course registration system"
                    >
                      Student Login
                    </Header>
                  }
                >
                  <Container>
                    <SpaceBetween direction="vertical" size="l">
                      {error && (
                        <Alert type="error" dismissible onDismiss={() => setError(null)}>
                          {error}
                        </Alert>
                      )}

                      <FormField
                        label="Student ID"
                        description="Enter your G-number"
                        errorText={attemptedSubmit && !studentId.trim() ? 'Student ID is required' : undefined}
                      >
                        <Input
                          value={studentId}
                          onChange={({ detail }) => setStudentId(detail.value)}
                          placeholder="e.g., G00123456"
                          autoComplete="username"
                        />
                      </FormField>

                      <FormField
                        label="Password"
                        description="Enter your password"
                        errorText={attemptedSubmit && !password.trim() ? 'Password is required' : undefined}
                      >
                        <Input
                          value={password}
                          onChange={({ detail }) => setPassword(detail.value)}
                          type="password"
                          autoComplete="current-password"
                        />
                      </FormField>

                      <Box textAlign='center' margin={{top:'xxs'}}>
                        <span style={{ color: 'var(--color-text-body-secondary)' }}>
                          New user?{' '}
                        </span>
                        <Link 
                          onFollow={() => navigate('/signup')} 
                          variant='primary'
                        >
                          Sign up
                        </Link>
                      </Box>
                    </SpaceBetween>
                  </Container>
                </Form>
              </form>
            </Container>
          </div>
        }
        toolsHide
        navigationHide
      />
    </>
  );
};

export default Login;
