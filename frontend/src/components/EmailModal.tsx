import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  SpaceBetween,
  FormField,
  Input,
  Select,
  Checkbox,
  Button,
  Alert,
} from "@cloudscape-design/components";
import { Email } from "../types";

interface EmailModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (email: Omit<Email, "id">) => Promise<boolean>;
  email?: Email;
  mode: "add" | "edit";
}

const EMAIL_TYPES = [
  { label: "University", value: "university" },
  { label: "Personal", value: "personal" },
];

const EmailModal: React.FC<EmailModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  email,
  mode,
}) => {
  const [formData, setFormData] = useState({
    type: "personal" as Email["type"],
    address: "",
    isPrimary: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isUniversityEmail = email?.type === "university" && mode === "edit";

  useEffect(() => {
    if (email && mode === "edit") {
      setFormData({
        type: email.type,
        address: email.address,
        isPrimary: email.isPrimary,
      });
    } else {
      setFormData({
        type: "personal",
        address: "",
        isPrimary: false,
      });
    }
    setErrors({});
  }, [email, mode, visible]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.address.trim()) {
      newErrors.address = "Email address is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.address)) {
        newErrors.address = "Invalid email format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    const success = await onSubmit(formData);
    setLoading(false);

    if (success) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={mode === "add" ? "Add Email Address" : "Edit Email Address"}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={isUniversityEmail}
            >
              {mode === "add" ? "Add" : "Save"}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="m">
        {isUniversityEmail && (
          <Alert type="warning">
            University email addresses cannot be modified. Contact the
            registrar's office to update your university email.
          </Alert>
        )}

        <FormField label="Email Type" errorText={errors.type}>
          <Select
            selectedOption={
              EMAIL_TYPES.find((t) => t.value === formData.type) || null
            }
            onChange={({ detail }) =>
              setFormData({
                ...formData,
                type: detail.selectedOption.value as Email["type"],
              })
            }
            options={EMAIL_TYPES}
            disabled={isUniversityEmail}
          />
        </FormField>

        <FormField label="Email Address" errorText={errors.address}>
          <Input
            value={formData.address}
            onChange={({ detail }) =>
              setFormData({ ...formData, address: detail.value })
            }
            placeholder={formData?.type === "university" ? "student@gsumail.gram.edu" : "contact@example.com"}
            type="email"
            disabled={isUniversityEmail}
          />
        </FormField>

        <Checkbox
          checked={formData.isPrimary}
          onChange={({ detail }) =>
            setFormData({ ...formData, isPrimary: detail.checked })
          }
          disabled={isUniversityEmail}
        >
          Set as primary email address
        </Checkbox>
      </SpaceBetween>
    </Modal>
  );
};

export default EmailModal;
