import { useState } from "react";
import {
  useNavigate,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import {
  AppLayout,
  TextContent,
  TopNavigation,
  Spinner,
  Alert,
} from "@cloudscape-design/components";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import CourseCatalog from "./pages/CourseCatalog";
import Schedule from "./pages/Schedule";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { ProfileProvider } from "./contexts/ProfileContext";

const AppContent = () => {
  const { isAuthenticated, currentStudent, logout, loading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(true);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

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
          },
          {
            type: "menu-dropdown",
            iconName: "user-profile",
            text: currentStudent?.name || "Student",
            items: [
              { id: "profile", text: "Profile" },
              { id: "logout", text: "Log Out" },
            ],
            onItemClick: async (event) => {
              if (event.detail.id === "logout") {
                await logout();
                navigate("/login");
              } else if (event.detail.id === "profile") {
                navigate("/profile");
              }
            },
          },
        ]}
      />
      <AppLayout
        navigation={<Navigation />}
        notifications={
          showAlert ? (
            <Alert
              dismissible
              type="info"
              header="Don't Miss Out! Your Registration is not Finalized Until -"
              onDismiss={() => setShowAlert(false)}
            >
              <TextContent>
                <ul>
                  <li>Select your classes through the Course Catalog</li>
                  <li>
                    Select Accept/Pay Fees and complete the payment process.
                  </li>
                </ul>
                <h5>
                  Note: If you do not complete these two steps, you will be
                  dropped from your classes.
                </h5>
              </TextContent>
            </Alert>
          ) : null
        }
        content={
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        }
        toolsHide
        navigationWidth={250}
      />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <Router>
            <AppContent />
          </Router>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
