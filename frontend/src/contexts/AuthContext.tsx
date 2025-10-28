import React, { createContext, useContext, useEffect, useState } from 'react';
import { Student } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  currentStudent: Student | null;
  login: (studentId: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkExistingSession = () => {
      try {
        const savedStudent = localStorage.getItem('currentStudent');
        const savedAuth = localStorage.getItem('isAuthenticated');
        
        if (savedStudent && savedAuth === 'true') {
          const student = JSON.parse(savedStudent);
          setCurrentStudent(student);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading saved session:', error);
        // Clear invalid session data
        localStorage.removeItem('currentStudent');
        localStorage.removeItem('isAuthenticated');
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const login = async (studentId: string, password: string): Promise<boolean> => {
    // Simulate authentication - accept any non-empty credentials
    if (!studentId.trim() || !password.trim()) {
      return false;
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create a mock student object
    const student: Student = {
      id: studentId,
      name: `${studentId}`,
      email: `${studentId.toLowerCase()}@gsumail.gram.edu`,
      major: 'Computer Science',
      year: 3,
      enrolledCourses: []
    };

    // Store in localStorage
    localStorage.setItem('currentStudent', JSON.stringify(student));
    localStorage.setItem('isAuthenticated', 'true');
    
    setCurrentStudent(student);
    setIsAuthenticated(true);
    
    return true;
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('currentStudent');
    localStorage.removeItem('isAuthenticated');
    
    setCurrentStudent(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    currentStudent,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
