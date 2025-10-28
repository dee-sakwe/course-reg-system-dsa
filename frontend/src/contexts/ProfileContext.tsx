import React, { createContext, useContext, useEffect, useState } from "react";
import {
  StudentProfile,
  Address,
  Phone,
  Email,
  EmergencyContact,
  UserPreferences,
} from "../types";
import { useAuth } from "./AuthContext";

interface ProfileContextType {
  profile: StudentProfile | null;
  loading: boolean;
  updatePersonalInfo: (info: Partial<StudentProfile>) => Promise<boolean>;
  addAddress: (address: Omit<Address, "id">) => Promise<boolean>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  addPhone: (phone: Omit<Phone, "id">) => Promise<boolean>;
  updatePhone: (id: string, phone: Partial<Phone>) => Promise<boolean>;
  deletePhone: (id: string) => Promise<boolean>;
  addEmail: (email: Omit<Email, "id">) => Promise<boolean>;
  updateEmail: (id: string, email: Partial<Email>) => Promise<boolean>;
  deleteEmail: (id: string) => Promise<boolean>;
  addEmergencyContact: (
    contact: Omit<EmergencyContact, "id">
  ) => Promise<boolean>;
  updateEmergencyContact: (
    id: string,
    contact: Partial<EmergencyContact>
  ) => Promise<boolean>;
  deleteEmergencyContact: (id: string) => Promise<boolean>;
  updatePreferences: (
    preferences: Partial<UserPreferences>
  ) => Promise<boolean>;
  updateSecuritySettings: (settings: {
    securityQuestion?: string;
  }) => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

interface ProfileProviderProps {
  children: React.ReactNode;
}

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const ProfileProvider: React.FC<ProfileProviderProps> = ({
  children,
}) => {
  const { currentStudent, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && currentStudent) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [isAuthenticated, currentStudent]);

  const loadProfile = () => {
    try {
      const savedProfile = localStorage.getItem("studentProfile");
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else if (currentStudent) {
        // Create initial profile from current student
        const initialProfile: StudentProfile = {
          ...currentStudent,
          firstName: currentStudent.name.split(" ")[0] || "",
          lastName: currentStudent.name.split(" ").slice(1).join(" ") || "",
          middleName: "",
          dateOfBirth: "",
          maritalStatus: "single",
          addresses: [
            {
              id: generateId(),
              type: "campus",
              street: "403 Main Street",
              city: "Grambling",
              state: "LA",
              zipCode: "71245",
              country: "USA",
              isPrimary: true,
            },
          ],
          phones: [
            {
              id: generateId(),
              type: "mobile",
              number: "(318) 555-0123",
              isPrimary: true,
            },
          ],
          emails: [
            {
              id: generateId(),
              type: "university",
              address: currentStudent.email,
              isPrimary: true,
            },
          ],
          emergencyContacts: [
            {
              id: generateId(),
              name: "Parent/Guardian",
              relationship: "Parent",
              phone: "(318) 555-0100",
              email: "parent@example.com",
              isPrimary: true,
            },
          ],
          gpa: 3.5,
          classification:
            currentStudent.year === 1
              ? "Freshman"
              : currentStudent.year === 2
              ? "Sophomore"
              : currentStudent.year === 3
              ? "Junior"
              : "Senior",
          advisor: "Dr. Smith",
          securityQuestion: "What is your favorite color?",
          preferences: {
            notifications: {
              email: true,
              sms: false,
              courseUpdates: true,
              gradeAlerts: true,
              registrationReminders: true,
            },
            theme: "system",
            language: "en-US",
            timezone: "America/Chicago",
          },
        };
        setProfile(initialProfile);
        localStorage.setItem("studentProfile", JSON.stringify(initialProfile));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem("studentProfile", JSON.stringify(updatedProfile));
  };

  const updatePersonalInfo = async (
    info: Partial<StudentProfile>
  ): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      const updatedProfile = { ...profile, ...info };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error updating personal info:", error);
      return false;
    }
  };

  const addAddress = async (address: Omit<Address, "id">): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newAddress: Address = { ...address, id: generateId() };

      // If this is set as primary, unset other primaries
      let addresses = profile.addresses;
      if (newAddress.isPrimary) {
        addresses = addresses.map((a) => ({ ...a, isPrimary: false }));
      }

      const updatedProfile = {
        ...profile,
        addresses: [...addresses, newAddress],
      };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error adding address:", error);
      return false;
    }
  };

  const updateAddress = async (
    id: string,
    address: Partial<Address>
  ): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let addresses = profile.addresses.map((a) =>
        a.id === id ? { ...a, ...address } : a
      );

      // If this is set as primary, unset other primaries
      if (address.isPrimary) {
        addresses = addresses.map((a) =>
          a.id === id ? a : { ...a, isPrimary: false }
        );
      }

      const updatedProfile = { ...profile, addresses };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error updating address:", error);
      return false;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const addresses = profile.addresses.filter((a) => a.id !== id);
      const updatedProfile = { ...profile, addresses };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error deleting address:", error);
      return false;
    }
  };

  const addPhone = async (phone: Omit<Phone, "id">): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newPhone: Phone = { ...phone, id: generateId() };

      let phones = profile.phones;
      if (newPhone.isPrimary) {
        phones = phones.map((p) => ({ ...p, isPrimary: false }));
      }

      const updatedProfile = {
        ...profile,
        phones: [...phones, newPhone],
      };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error adding phone:", error);
      return false;
    }
  };

  const updatePhone = async (
    id: string,
    phone: Partial<Phone>
  ): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let phones = profile.phones.map((p) =>
        p.id === id ? { ...p, ...phone } : p
      );

      if (phone.isPrimary) {
        phones = phones.map((p) =>
          p.id === id ? p : { ...p, isPrimary: false }
        );
      }

      const updatedProfile = { ...profile, phones };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error updating phone:", error);
      return false;
    }
  };

  const deletePhone = async (id: string): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const phones = profile.phones.filter((p) => p.id !== id);
      const updatedProfile = { ...profile, phones };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error deleting phone:", error);
      return false;
    }
  };

  const addEmail = async (email: Omit<Email, "id">): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newEmail: Email = { ...email, id: generateId() };

      let emails = profile.emails;
      if (newEmail.isPrimary) {
        emails = emails.map((e) => ({ ...e, isPrimary: false }));
      }

      const updatedProfile = {
        ...profile,
        emails: [...emails, newEmail],
      };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error adding email:", error);
      return false;
    }
  };

  const updateEmail = async (
    id: string,
    email: Partial<Email>
  ): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let emails = profile.emails.map((e) =>
        e.id === id ? { ...e, ...email } : e
      );

      if (email.isPrimary) {
        emails = emails.map((e) =>
          e.id === id ? e : { ...e, isPrimary: false }
        );
      }

      const updatedProfile = { ...profile, emails };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error updating email:", error);
      return false;
    }
  };

  const deleteEmail = async (id: string): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const emails = profile.emails.filter((e) => e.id !== id);
      const updatedProfile = { ...profile, emails };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error deleting email:", error);
      return false;
    }
  };

  const addEmergencyContact = async (
    contact: Omit<EmergencyContact, "id">
  ): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newContact: EmergencyContact = { ...contact, id: generateId() };

      let emergencyContacts = profile.emergencyContacts;
      if (newContact.isPrimary) {
        emergencyContacts = emergencyContacts.map((c) => ({
          ...c,
          isPrimary: false,
        }));
      }

      const updatedProfile = {
        ...profile,
        emergencyContacts: [...emergencyContacts, newContact],
      };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error adding emergency contact:", error);
      return false;
    }
  };

  const updateEmergencyContact = async (
    id: string,
    contact: Partial<EmergencyContact>
  ): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let emergencyContacts = profile.emergencyContacts.map((c) =>
        c.id === id ? { ...c, ...contact } : c
      );

      if (contact.isPrimary) {
        emergencyContacts = emergencyContacts.map((c) =>
          c.id === id ? c : { ...c, isPrimary: false }
        );
      }

      const updatedProfile = { ...profile, emergencyContacts };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error updating emergency contact:", error);
      return false;
    }
  };

  const deleteEmergencyContact = async (id: string): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const emergencyContacts = profile.emergencyContacts.filter(
        (c) => c.id !== id
      );
      const updatedProfile = { ...profile, emergencyContacts };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error deleting emergency contact:", error);
      return false;
    }
  };

  const updatePreferences = async (
    preferences: Partial<UserPreferences>
  ): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const updatedProfile = {
        ...profile,
        preferences: {
          ...profile.preferences,
          ...preferences,
          notifications: {
            ...profile.preferences.notifications,
            ...(preferences.notifications || {}),
          },
        },
      };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error updating preferences:", error);
      return false;
    }
  };

  const updateSecuritySettings = async (settings: {
    securityQuestion?: string;
  }): Promise<boolean> => {
    if (!profile) return false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const updatedProfile = { ...profile, ...settings };
      saveProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error("Error updating security settings:", error);
      return false;
    }
  };

  const value = {
    profile,
    loading,
    updatePersonalInfo,
    addAddress,
    updateAddress,
    deleteAddress,
    addPhone,
    updatePhone,
    deletePhone,
    addEmail,
    updateEmail,
    deleteEmail,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    updatePreferences,
    updateSecuritySettings,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};
