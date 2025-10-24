import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout, TopNavigation } from '@cloudscape-design/components';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import CourseCatalog from './pages/CourseCatalog';
import Schedule from './pages/Schedule';

function App() {
  return (
    <Router>
      <TopNavigation
        identity={{
          href: '/',
          title: 'Course Registration System',
        }}
        utilities={[
          {
            type: 'button',
            text: 'Student',
            iconName: 'user-profile',
          },
        ]}
      />
      <AppLayout
        navigation={<Navigation />}
        content={
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/schedule" element={<Schedule />} />
          </Routes>
        }
        toolsHide
        navigationWidth={200}
      />
    </Router>
  );
}

export default App;
