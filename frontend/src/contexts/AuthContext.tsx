import React, { createContext, useContext, useEffect, useState } from 'react';
import { Student } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  currentStudent: Student | null;
  login: (studentId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
    if (!studentId.trim() || !password.trim()) {
      return false;
    }

    try {
      const { authService } = await import('../services/api');
      const result = await authService.login(studentId, password);
      
      if (result.student) {
        // Store in localStorage
        localStorage.setItem('currentStudent', JSON.stringify(result.student));
        localStorage.setItem('isAuthenticated', 'true');
        
        setCurrentStudent(result.student);
        setIsAuthenticated(true);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { authService } = await import('../services/api');
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage regardless of API call result
      localStorage.removeItem('currentStudent');
      localStorage.removeItem('isAuthenticated');
      
      setCurrentStudent(null);
      setIsAuthenticated(false);
    }
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
