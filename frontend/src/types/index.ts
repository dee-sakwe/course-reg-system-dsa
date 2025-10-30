export interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
  credits: number;
  instructor: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  prerequisites?: string[];
}

export interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string;
  major: string;
  year: number;
  password?: string;
}

export interface Address {
  id: string;
  type: 'home' | 'campus' | 'permanent' | 'mailing';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
}

export interface Phone {
  id: string;
  type: 'mobile' | 'home' | 'work';
  number: string;
  isPrimary: boolean;
}

export interface Email {
  id: string;
  type: 'university' | 'personal';
  address: string;
  isPrimary: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    courseUpdates: boolean;
    gradeAlerts: boolean;
    registrationReminders: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
}

export interface StudentProfile extends Student {
  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  ssn?: string; // masked display only
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  
  // Contact Information
  addresses: Address[];
  phones: Phone[];
  emails: Email[];
  
  // Emergency Contacts
  emergencyContacts: EmergencyContact[];
  
  // Academic Information
  gpa?: number;
  classification?: string; // Freshman, Sophomore, etc.
  advisor?: string;
  
  // Security
  securityQuestion?: string;
  
  // Preferences
  preferences: UserPreferences;
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  course_name: string;
  course_code: string;
  enrolled_date: string;
  semester?: string;
}

export interface Schedule {
  studentId: string;
  courses: Course[];
  totalCredits: number;
}
