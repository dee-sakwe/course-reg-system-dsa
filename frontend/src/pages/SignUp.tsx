import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@cloudscape-design/components";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const SignUp = () => {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (
      !studentId.trim() ||
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate G-number format
    const idRegex = /^G00[0-9]{6}$/;
    if (!idRegex.test(studentId)) {
      setError("Please enter a valid student ID.");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Import authService dynamically
      const { authService } = await import("../services/api");
      
      // Register the student
      const result = await authService.register(
        studentId,
        name,
        email,
        major,
        parseInt(year) || 1,
        password
      );

      if (result.student) {
        // Auto-login after successful registration
        const success = await login(studentId, password);
        
        if (success) {
          navigate("/");
        } else {
          setError("Account created but login failed. Please try logging in manually.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNavigation
        identity={{
          href: "#",
          title: "Grambling State University",
          logo: {
            src: "/images/Grambling_State_Tigers_logo.svg",
            alt: "Grambling State University Logo",
          },
        }}
        utilities={[
          {
            type: "button",
            variant: "primary-button",
            text: isDarkMode ? "Dark mode" : "Light mode",
            iconUrl: isDarkMode
              ? "/images/dark_mode_moon_black.svg"
              : "/images/light_mode_sun_black.svg",
            iconAlt: "Toggle Theme",
            title: isDarkMode ? "Switch to light mode" : "Switch to dark mode",
            onClick: toggleTheme,
            disableUtilityCollapse: true,
          },
        ]}
      />
      <AppLayout
        content={
          <div
            style={{
              minHeight: "80vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <Container>
              <form onSubmit={handleSubmit}>
                <Form
                  actions={
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button
                        formAction="none"
                        variant="link"
                        onClick={() => {
                          setStudentId("");
                          setName("");
                          setEmail("");
                          setPassword("");
                          setConfirmPassword("");
                          setError(null);
                          setAttemptedSubmit(false);
                        }}
                      >
                        Clear
                      </Button>
                      <Button variant="primary" loading={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </SpaceBetween>
                  }
                  header={
                    <Header
                      variant="h1"
                      description="Create a new account to access the course registration system"
                    >
                      Student Sign Up
                    </Header>
                  }
                >
                  <Container>
                    <SpaceBetween direction="vertical" size="l">
                      {error && (
                        <Alert
                          type="error"
                          dismissible
                          onDismiss={() => setError(null)}
                        >
                          {error}
                        </Alert>
                      )}

                      <FormField
                        label="Student ID"
                        description="Enter your G-number"
                        errorText={
                          attemptedSubmit && !studentId.trim()
                            ? "Student ID is required"
                            : undefined
                        }
                      >
                        <Input
                          value={studentId}
                          onChange={({ detail }) => setStudentId(detail.value)}
                          placeholder="e.g., G00123456"
                          autoComplete="username"
                        />
                      </FormField>

                      <FormField
                        label="Full Name"
                        description="Enter your full name"
                        errorText={
                          attemptedSubmit && !name.trim()
                            ? "Name is required"
                            : undefined
                        }
                      >
                        <Input
                          value={name}
                          onChange={({ detail }) => setName(detail.value)}
                          placeholder="e.g., John Doe"
                          autoComplete="name"
                        />
                      </FormField>

                      <FormField
                        label="Email Address"
                        description="Enter your university email address"
                        errorText={
                          attemptedSubmit && !email.trim()
                            ? "Email is required"
                            : undefined
                        }
                      >
                        <Input
                          value={email}
                          onChange={({ detail }) => setEmail(detail.value)}
                          placeholder="e.g., student@gsumail.gram.edu"
                          type="email"
                          autoComplete="email"
                        />
                      </FormField>

                      <FormField
                        label="Major"
                        description="Enter your major"
                        errorText={
                          attemptedSubmit && !major.trim()
                            ? "Major is required"
                            : undefined
                        }
                      >
                        <Input
                          value={major}
                          onChange={({ detail }) => setMajor(detail.value)}
                          placeholder="e.g., Computer Science"
                          autoComplete="major"
                        />
                      </FormField>

                      <FormField
                        label="Year"
                        description="Enter your year"
                        errorText={
                          attemptedSubmit && !year.trim()
                            ? "Year is required"
                            : undefined
                        }
                      >
                        <Input
                          value={year}
                          onChange={({ detail }) => setYear(detail.value)}
                          placeholder="e.g., 1 for Freshman, 2 for Sophomore, 3 for Junior, 4 for Senior"
                          autoComplete="year"
                        />
                      </FormField>

                      <FormField
                        label="Password"
                        description="Create a password (minimum 6 characters)"
                        errorText={
                          attemptedSubmit && !password.trim()
                            ? "Password is required"
                            : undefined
                        }
                      >
                        <Input
                          value={password}
                          onChange={({ detail }) => setPassword(detail.value)}
                          type="password"
                          autoComplete="new-password"
                        />
                      </FormField>

                      <FormField
                        label="Confirm Password"
                        description="Re-enter your password"
                        errorText={
                          attemptedSubmit && !confirmPassword.trim()
                            ? "Please confirm your password"
                            : undefined
                        }
                      >
                        <Input
                          value={confirmPassword}
                          onChange={({ detail }) =>
                            setConfirmPassword(detail.value)
                          }
                          type="password"
                          autoComplete="new-password"
                        />
                      </FormField>

                      <Box textAlign="center" margin={{ top: "xxs" }}>
                        <span
                          style={{ color: "var(--color-text-body-secondary)" }}
                        >
                          Already have an account?{" "}
                        </span>
                        <Link
                          onFollow={() => navigate("/login")}
                          variant="primary"
                        >
                          Sign in
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

export default SignUp;
