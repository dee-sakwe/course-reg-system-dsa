import { useState } from "react";
import {
  ContentLayout,
  Header,
  SpaceBetween,
  Tabs,
  Container,
  ColumnLayout,
  FormField,
  Input,
  Select,
  Button,
  Table,
  Badge,
  Box,
  BreadcrumbGroup,
  Alert,
  Toggle,
  Flashbar,
  FlashbarProps,
} from "@cloudscape-design/components";
import { useProfile } from "../contexts/ProfileContext";
import { useTheme } from "../contexts/ThemeContext";
import AddressModal from "../components/AddressModal";
import PhoneModal from "../components/PhoneModal";
import EmailModal from "../components/EmailModal";
import EmergencyContactModal from "../components/EmergencyContactModal";
import { Address, Phone, Email, EmergencyContact } from "../types";

const Profile = () => {
  const {
    profile,
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
  } = useProfile();
  const { isDarkMode, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("personal");
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [flashMessages, setFlashMessages] = useState<
    FlashbarProps.MessageDefinition[]
  >([]);

  // Personal Info State
  const [personalForm, setPersonalForm] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    major: "",
    maritalStatus: "single" as "single" | "married" | "divorced" | "widowed",
  });

  // Modal States
  const [addressModal, setAddressModal] = useState<{
    visible: boolean;
    mode: "add" | "edit";
    address?: Address;
  }>({
    visible: false,
    mode: "add",
  });
  const [phoneModal, setPhoneModal] = useState<{
    visible: boolean;
    mode: "add" | "edit";
    phone?: Phone;
  }>({
    visible: false,
    mode: "add",
  });
  const [emailModal, setEmailModal] = useState<{
    visible: boolean;
    mode: "add" | "edit";
    email?: Email;
  }>({
    visible: false,
    mode: "add",
  });
  const [emergencyModal, setEmergencyModal] = useState<{
    visible: boolean;
    mode: "add" | "edit";
    contact?: EmergencyContact;
  }>({
    visible: false,
    mode: "add",
  });

  // Preferences State
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: profile?.preferences.notifications.email || true,
    sms: profile?.preferences.notifications.sms || false,
    courseUpdates: profile?.preferences.notifications.courseUpdates || true,
    gradeAlerts: profile?.preferences.notifications.gradeAlerts || true,
    registrationReminders:
      profile?.preferences.notifications.registrationReminders || true,
  });

  const handleToggleChange = (
    key: keyof typeof notificationPrefs,
    checked: boolean
  ) => {
    setNotificationPrefs({ ...notificationPrefs, [key]: checked });
  };

  const addFlashMessage = (message: FlashbarProps.MessageDefinition) => {
    setFlashMessages([message]);
    setTimeout(() => setFlashMessages([]), 5000);
  };

  const handleEditPersonal = () => {
    if (profile) {
      setPersonalForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        middleName: profile.middleName || "",
        dateOfBirth: profile.dateOfBirth || "",
        major: profile.major,
        maritalStatus: profile.maritalStatus || "single",
      });
      setEditingPersonal(true);
    }
  };

  const handleSavePersonal = async () => {
    const success = await updatePersonalInfo(personalForm);
    if (success) {
      setEditingPersonal(false);
      addFlashMessage({
        type: "success",
        content: "Personal information updated successfully",
        dismissible: true,
      });
    } else {
      addFlashMessage({
        type: "error",
        content: "Failed to update personal information",
        dismissible: true,
      });
    }
  };

  const handleSavePreferences = async () => {
    const success = await updatePreferences({
      notifications: notificationPrefs,
    });
    if (success) {
      addFlashMessage({
        type: "success",
        content: "Preferences updated successfully",
        dismissible: true,
      });
    } else {
      addFlashMessage({
        type: "error",
        content: "Failed to update preferences",
        dismissible: true,
      });
    }
  };

  if (!profile) {
    return (
      <ContentLayout header={<Header variant="h1">Profile</Header>}>
        <Container>
          <Box textAlign="center" padding="xxl">
            <SpaceBetween size="m">
              <Box variant="h2">Loading profile...</Box>
            </SpaceBetween>
          </Box>
        </Container>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout
      header={
        <SpaceBetween size="m">
          <BreadcrumbGroup
            items={[
              { text: "Home", href: "/" },
              { text: "Profile", href: "/profile" },
            ]}
          />
          <Header
            variant="h1"
            description="Manage your personal information, contacts, and preferences"
          >
            Student Profile
          </Header>
        </SpaceBetween>
      }
    >
      <SpaceBetween size="l">
        <Flashbar items={flashMessages} />

        <Tabs
          activeTabId={activeTab}
          onChange={({ detail }) => setActiveTab(detail.activeTabId)}
          tabs={[
            {
              id: "personal",
              label: "Personal Information",
              content: (
                <Container
                  header={
                    <Header
                      variant="h2"
                      actions={
                        <SpaceBetween direction="horizontal" size="xs">
                          {editingPersonal ? (
                            <>
                              <Button onClick={() => setEditingPersonal(false)}>
                                Cancel
                              </Button>
                              <Button
                                variant="primary"
                                onClick={handleSavePersonal}
                              >
                                Save
                              </Button>
                            </>
                          ) : (
                            <Button onClick={handleEditPersonal}>Edit</Button>
                          )}
                        </SpaceBetween>
                      }
                    >
                      Personal Details
                    </Header>
                  }
                >
                  <ColumnLayout columns={2} variant="text-grid">
                    <SpaceBetween size="l">
                      <FormField label="First Name">
                        {editingPersonal ? (
                          <Input
                            value={personalForm.firstName}
                            onChange={({ detail }) =>
                              setPersonalForm({
                                ...personalForm,
                                firstName: detail.value,
                              })
                            }
                          />
                        ) : (
                          <Box>{profile.firstName}</Box>
                        )}
                      </FormField>

                      <FormField label="Middle Name">
                        {editingPersonal ? (
                          <Input
                            value={personalForm.middleName}
                            onChange={({ detail }) =>
                              setPersonalForm({
                                ...personalForm,
                                middleName: detail.value,
                              })
                            }
                          />
                        ) : (
                          <Box>{profile.middleName || "N/A"}</Box>
                        )}
                      </FormField>

                      <FormField label="Last Name">
                        {editingPersonal ? (
                          <Input
                            value={personalForm.lastName}
                            onChange={({ detail }) =>
                              setPersonalForm({
                                ...personalForm,
                                lastName: detail.value,
                              })
                            }
                          />
                        ) : (
                          <Box>{profile.lastName}</Box>
                        )}
                      </FormField>

                      <FormField label="Student ID">
                        <Box>{profile.id}</Box>
                      </FormField>

                      <FormField label="Date of Birth">
                        {editingPersonal ? (
                          <Input
                            value={personalForm.dateOfBirth}
                            onChange={({ detail }) =>
                              setPersonalForm({
                                ...personalForm,
                                dateOfBirth: detail.value,
                              })
                            }
                            placeholder="YYYY-MM-DD"
                          />
                        ) : (
                          <Box>{profile.dateOfBirth || "Not set"}</Box>
                        )}
                      </FormField>
                    </SpaceBetween>

                    <SpaceBetween size="l">
                      <FormField label="Major">
                        {editingPersonal ? (
                          <Input
                            value={personalForm.major}
                            onChange={({ detail }) =>
                              setPersonalForm({
                                ...personalForm,
                                major: detail.value,
                              })
                            }
                          />
                        ) : (
                          <Box>{profile.major}</Box>
                        )}
                      </FormField>

                      <FormField label="Classification">
                        <Box>{profile.classification || "N/A"}</Box>
                      </FormField>

                      <FormField label="GPA">
                        <Box>{profile.gpa?.toFixed(2) || "N/A"}</Box>
                      </FormField>

                      <FormField label="Academic Advisor">
                        <Box>{profile.advisor || "Not assigned"}</Box>
                      </FormField>

                      <FormField label="Marital Status">
                        {editingPersonal ? (
                          <Select
                            selectedOption={{
                              label: personalForm.maritalStatus,
                              value: personalForm.maritalStatus,
                            }}
                            onChange={({ detail }) =>
                              setPersonalForm({
                                ...personalForm,
                                maritalStatus: detail.selectedOption
                                  .value as any,
                              })
                            }
                            options={[
                              { label: "single", value: "single" },
                              { label: "married", value: "married" },
                              { label: "divorced", value: "divorced" },
                              { label: "widowed", value: "widowed" },
                            ]}
                          />
                        ) : (
                          <Box>{profile.maritalStatus || "Not specified"}</Box>
                        )}
                      </FormField>
                    </SpaceBetween>
                  </ColumnLayout>
                </Container>
              ),
            },
            {
              id: "contact",
              label: "Contact Information",
              content: (
                <SpaceBetween size="l">
                  {/* Addresses */}
                  <Container
                    header={
                      <Header
                        variant="h2"
                        actions={
                          <Button
                            onClick={() =>
                              setAddressModal({ visible: true, mode: "add" })
                            }
                          >
                            Add Address
                          </Button>
                        }
                      >
                        Addresses
                      </Header>
                    }
                  >
                    <Table
                      columnDefinitions={[
                        {
                          id: "type",
                          header: "Type",
                          cell: (item) =>
                            item.type.charAt(0).toUpperCase() +
                            item.type.slice(1),
                        },
                        {
                          id: "address",
                          header: "Address",
                          cell: (item) =>
                            `${item.street}, ${item.city}, ${item.state} ${item.zipCode}`,
                        },
                        {
                          id: "primary",
                          header: "Primary",
                          cell: (item) =>
                            item.isPrimary ? (
                              <Badge color="blue">Primary</Badge>
                            ) : null,
                        },
                        {
                          id: "actions",
                          header: "Actions",
                          cell: (item) => (
                            <SpaceBetween direction="horizontal" size="xs">
                              <Button
                                onClick={() =>
                                  setAddressModal({
                                    visible: true,
                                    mode: "edit",
                                    address: item,
                                  })
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={async () => {
                                  const success = await deleteAddress(item.id);
                                  if (success) {
                                    addFlashMessage({
                                      type: "success",
                                      content: "Address deleted",
                                      dismissible: true,
                                    });
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </SpaceBetween>
                          ),
                        },
                      ]}
                      items={profile.addresses}
                      empty={
                        <Box textAlign="center" color="inherit">
                          <b>No addresses</b>
                          <Box
                            padding={{ bottom: "s" }}
                            variant="p"
                            color="inherit"
                          >
                            Add an address to get started.
                          </Box>
                        </Box>
                      }
                    />
                  </Container>

                  {/* Phone Numbers */}
                  <Container
                    header={
                      <Header
                        variant="h2"
                        actions={
                          <Button
                            onClick={() =>
                              setPhoneModal({ visible: true, mode: "add" })
                            }
                          >
                            Add Phone
                          </Button>
                        }
                      >
                        Phone Numbers
                      </Header>
                    }
                  >
                    <Table
                      columnDefinitions={[
                        {
                          id: "type",
                          header: "Type",
                          cell: (item) =>
                            item.type.charAt(0).toUpperCase() +
                            item.type.slice(1),
                        },
                        {
                          id: "number",
                          header: "Number",
                          cell: (item) => item.number,
                        },
                        {
                          id: "primary",
                          header: "Primary",
                          cell: (item) =>
                            item.isPrimary ? (
                              <Badge color="blue">Primary</Badge>
                            ) : null,
                        },
                        {
                          id: "actions",
                          header: "Actions",
                          cell: (item) => (
                            <SpaceBetween direction="horizontal" size="xs">
                              <Button
                                onClick={() =>
                                  setPhoneModal({
                                    visible: true,
                                    mode: "edit",
                                    phone: item,
                                  })
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={async () => {
                                  const success = await deletePhone(item.id);
                                  if (success) {
                                    addFlashMessage({
                                      type: "success",
                                      content: "Phone deleted",
                                      dismissible: true,
                                    });
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </SpaceBetween>
                          ),
                        },
                      ]}
                      items={profile.phones}
                      empty={
                        <Box textAlign="center" color="inherit">
                          <b>No phone numbers</b>
                        </Box>
                      }
                    />
                  </Container>

                  {/* Emails */}
                  <Container
                    header={
                      <Header
                        variant="h2"
                        actions={
                          <Button
                            onClick={() =>
                              setEmailModal({ visible: true, mode: "add" })
                            }
                          >
                            Add Email
                          </Button>
                        }
                      >
                        Email Addresses
                      </Header>
                    }
                  >
                    <Table
                      columnDefinitions={[
                        {
                          id: "type",
                          header: "Type",
                          cell: (item) =>
                            item.type.charAt(0).toUpperCase() +
                            item.type.slice(1),
                        },
                        {
                          id: "address",
                          header: "Email",
                          cell: (item) => item.address,
                        },
                        {
                          id: "primary",
                          header: "Primary",
                          cell: (item) =>
                            item.isPrimary ? (
                              <Badge color="blue">Primary</Badge>
                            ) : null,
                        },
                        {
                          id: "actions",
                          header: "Actions",
                          cell: (item) => (
                            <SpaceBetween direction="horizontal" size="xs">
                              <Button
                                onClick={() =>
                                  setEmailModal({
                                    visible: true,
                                    mode: "edit",
                                    email: item,
                                  })
                                }
                                disabled={item.type === "university"}
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={async () => {
                                  const success = await deleteEmail(item.id);
                                  if (success) {
                                    addFlashMessage({
                                      type: "success",
                                      content: "Email deleted",
                                      dismissible: true,
                                    });
                                  }
                                }}
                                disabled={item.type === "university"}
                              >
                                Delete
                              </Button>
                            </SpaceBetween>
                          ),
                        },
                      ]}
                      items={profile.emails}
                      empty={
                        <Box textAlign="center" color="inherit">
                          <b>No email addresses</b>
                        </Box>
                      }
                    />
                  </Container>
                </SpaceBetween>
              ),
            },
            {
              id: "emergency",
              label: "Emergency Contacts",
              content: (
                <Container
                  header={
                    <Header
                      variant="h2"
                      actions={
                        <Button
                          onClick={() =>
                            setEmergencyModal({ visible: true, mode: "add" })
                          }
                        >
                          Add Emergency Contact
                        </Button>
                      }
                    >
                      Emergency Contacts
                    </Header>
                  }
                >
                  <Table
                    columnDefinitions={[
                      {
                        id: "name",
                        header: "Name",
                        cell: (item) => item.name,
                      },
                      {
                        id: "relationship",
                        header: "Relationship",
                        cell: (item) => item.relationship,
                      },
                      {
                        id: "phone",
                        header: "Phone",
                        cell: (item) => item.phone,
                      },
                      {
                        id: "email",
                        header: "Email",
                        cell: (item) => item.email || "N/A",
                      },
                      {
                        id: "primary",
                        header: "Primary",
                        cell: (item) =>
                          item.isPrimary ? (
                            <Badge color="blue">Primary</Badge>
                          ) : null,
                      },
                      {
                        id: "actions",
                        header: "Actions",
                        cell: (item) => (
                          <SpaceBetween direction="horizontal" size="xs">
                            <Button
                              onClick={() =>
                                setEmergencyModal({
                                  visible: true,
                                  mode: "edit",
                                  contact: item,
                                })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={async () => {
                                const success = await deleteEmergencyContact(
                                  item.id
                                );
                                if (success) {
                                  addFlashMessage({
                                    type: "success",
                                    content: "Emergency contact deleted",
                                    dismissible: true,
                                  });
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </SpaceBetween>
                        ),
                      },
                    ]}
                    items={profile.emergencyContacts}
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No emergency contacts</b>
                        <Box
                          padding={{ bottom: "s" }}
                          variant="p"
                          color="inherit"
                        >
                          Add at least one emergency contact.
                        </Box>
                      </Box>
                    }
                  />
                </Container>
              ),
            },
            {
              id: "security",
              label: "Security Settings",
              content: (
                <SpaceBetween size="l">
                  <Alert type="info">
                    Security settings help protect your account. Contact IT
                    support for assistance with account security.
                  </Alert>

                  <Container header={<Header variant="h2">Change PIN</Header>}>
                    <SpaceBetween size="m">
                      <Box>
                        Update your account PIN for phone registration and other
                        services.
                      </Box>
                      <Button>Change PIN</Button>
                    </SpaceBetween>
                  </Container>

                  <Container
                    header={<Header variant="h2">Security Question</Header>}
                  >
                    <SpaceBetween size="m">
                      <Box>
                        Current Question:{" "}
                        {profile.securityQuestion || "Not set"}
                      </Box>
                      <Button>Update Security Question</Button>
                    </SpaceBetween>
                  </Container>

                  <Container
                    header={<Header variant="h2">Password Management</Header>}
                  >
                    <SpaceBetween size="m">
                      <Box>
                        Change your account password to keep your account
                        secure.
                      </Box>
                      <Button>Change Password</Button>
                    </SpaceBetween>
                  </Container>

                  <Container
                    header={
                      <Header variant="h2">Two-Factor Authentication</Header>
                    }
                  >
                    <SpaceBetween size="m">
                      <Box>
                        Add an extra layer of security to your account.{" "}
                        <Badge color="grey">Coming Soon</Badge>
                      </Box>
                      <Toggle checked={false} disabled={true}>
                        Enable Two-Factor Authentication
                      </Toggle>
                    </SpaceBetween>
                  </Container>
                </SpaceBetween>
              ),
            },
            {
              id: "preferences",
              label: "Preferences",
              content: (
                <SpaceBetween size="l">
                  <Container
                    header={
                      <Header
                        variant="h2"
                        actions={
                          <Button
                            variant="primary"
                            onClick={handleSavePreferences}
                          >
                            Save Preferences
                          </Button>
                        }
                      >
                        Notification Preferences
                      </Header>
                    }
                  >
                    <SpaceBetween size="m">
                      <Toggle
                        checked={notificationPrefs.email}
                        onChange={({ detail }) =>
                          handleToggleChange("email", detail.checked as boolean)
                        }
                      >
                        Email Notifications
                      </Toggle>
                      <Toggle
                        checked={notificationPrefs.sms}
                        onChange={({ detail }) =>
                          handleToggleChange("sms", detail.checked as boolean)
                        }
                      >
                        SMS Notifications
                      </Toggle>
                      <Toggle
                        checked={notificationPrefs.courseUpdates}
                        onChange={({ detail }) =>
                          handleToggleChange(
                            "courseUpdates",
                            detail.checked as boolean
                          )
                        }
                      >
                        Course Updates
                      </Toggle>
                      <Toggle
                        checked={notificationPrefs.gradeAlerts}
                        onChange={({ detail }) =>
                          handleToggleChange(
                            "gradeAlerts",
                            detail.checked as boolean
                          )
                        }
                      >
                        Grade Alerts
                      </Toggle>
                      <Toggle
                        checked={notificationPrefs.registrationReminders}
                        onChange={({ detail }) =>
                          handleToggleChange(
                            "registrationReminders",
                            detail.checked as boolean
                          )
                        }
                      >
                        Registration Reminders
                      </Toggle>
                    </SpaceBetween>
                  </Container>

                  <Container
                    header={<Header variant="h2">Display Preferences</Header>}
                  >
                    <SpaceBetween size="m">
                      <FormField label="Theme">
                        <Toggle checked={isDarkMode} onChange={toggleTheme}>
                          {isDarkMode ? "Dark Mode" : "Light Mode"}
                        </Toggle>
                      </FormField>
                      <FormField label="Language">
                        <Select
                          selectedOption={{
                            label: "English (US)",
                            value: "en-US",
                          }}
                          options={[{ label: "English (US)", value: "en-US" }]}
                          disabled={true}
                        />
                      </FormField>
                      <FormField label="Timezone">
                        <Select
                          selectedOption={{
                            label: "America/Chicago (CST)",
                            value: "America/Chicago",
                          }}
                          options={[
                            {
                              label: "America/Chicago (CST)",
                              value: "America/Chicago",
                            },
                          ]}
                          disabled={true}
                        />
                      </FormField>
                    </SpaceBetween>
                  </Container>

                  <Container
                    header={<Header variant="h2">Privacy Settings</Header>}
                  >
                    <SpaceBetween size="m">
                      <Toggle checked={false} disabled={true}>
                        Show in Directory
                      </Toggle>
                      <Toggle checked={false} disabled={true}>
                        Allow Contact Information Sharing
                      </Toggle>
                      <Box variant="small" color="text-status-inactive">
                        Privacy settings coming soon
                      </Box>
                    </SpaceBetween>
                  </Container>
                </SpaceBetween>
              ),
            },
          ]}
        />

        {/* Modals */}
        <AddressModal
          visible={addressModal.visible}
          mode={addressModal.mode}
          address={addressModal.address}
          onDismiss={() => setAddressModal({ ...addressModal, visible: false })}
          onSubmit={async (address) => {
            const success =
              addressModal.mode === "add"
                ? await addAddress(address)
                : await updateAddress(addressModal.address!.id, address);
            if (success) {
              addFlashMessage({
                type: "success",
                content: `Address ${
                  addressModal.mode === "add" ? "added" : "updated"
                } successfully`,
                dismissible: true,
              });
            }
            return success;
          }}
        />

        <PhoneModal
          visible={phoneModal.visible}
          mode={phoneModal.mode}
          phone={phoneModal.phone}
          onDismiss={() => setPhoneModal({ ...phoneModal, visible: false })}
          onSubmit={async (phone) => {
            const success =
              phoneModal.mode === "add"
                ? await addPhone(phone)
                : await updatePhone(phoneModal.phone!.id, phone);
            if (success) {
              addFlashMessage({
                type: "success",
                content: `Phone ${
                  phoneModal.mode === "add" ? "added" : "updated"
                } successfully`,
                dismissible: true,
              });
            }
            return success;
          }}
        />

        <EmailModal
          visible={emailModal.visible}
          mode={emailModal.mode}
          email={emailModal.email}
          onDismiss={() => setEmailModal({ ...emailModal, visible: false })}
          onSubmit={async (email) => {
            const success =
              emailModal.mode === "add"
                ? await addEmail(email)
                : await updateEmail(emailModal.email!.id, email);
            if (success) {
              addFlashMessage({
                type: "success",
                content: `Email ${
                  emailModal.mode === "add" ? "added" : "updated"
                } successfully`,
                dismissible: true,
              });
            }
            return success;
          }}
        />

        <EmergencyContactModal
          visible={emergencyModal.visible}
          mode={emergencyModal.mode}
          contact={emergencyModal.contact}
          onDismiss={() =>
            setEmergencyModal({ ...emergencyModal, visible: false })
          }
          onSubmit={async (contact) => {
            const success =
              emergencyModal.mode === "add"
                ? await addEmergencyContact(contact)
                : await updateEmergencyContact(
                    emergencyModal.contact!.id,
                    contact
                  );
            if (success) {
              addFlashMessage({
                type: "success",
                content: `Emergency contact ${
                  emergencyModal.mode === "add" ? "added" : "updated"
                } successfully`,
                dismissible: true,
              });
            }
            return success;
          }}
        />
      </SpaceBetween>
    </ContentLayout>
  );
};

export default Profile;
