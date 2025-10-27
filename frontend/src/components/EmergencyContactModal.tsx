import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  SpaceBetween,
  FormField,
  Input,
  Checkbox,
  Button,
} from "@cloudscape-design/components";
import { EmergencyContact } from "../types";

interface EmergencyContactModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (contact: Omit<EmergencyContact, "id">) => Promise<boolean>;
  contact?: EmergencyContact;
  mode: "add" | "edit";
}

const EmergencyContactModal: React.FC<EmergencyContactModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  contact,
  mode,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    isPrimary: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contact && mode === "edit") {
      setFormData({
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        email: contact.email || "",
        isPrimary: contact.isPrimary,
      });
    } else {
      setFormData({
        name: "",
        relationship: "",
        phone: "",
        email: "",
        isPrimary: false,
      });
    }
    setErrors({});
  }, [contact, mode, visible]);

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, "");

    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
        6,
        10
      )}`;
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.relationship.trim()) {
      newErrors.relationship = "Relationship is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const digits = formData.phone.replace(/\D/g, "");
      if (digits.length !== 10) {
        newErrors.phone = "Phone number must be 10 digits";
      }
    }
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    const success = await onSubmit({
      ...formData,
      email: formData.email || undefined,
    });
    setLoading(false);

    if (success) {
      onDismiss();
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData({ ...formData, phone: formatted });
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={
        mode === "add" ? "Add Emergency Contact" : "Edit Emergency Contact"
      }
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
              {mode === "add" ? "Add" : "Save"}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween size="m">
        <FormField label="Name" errorText={errors.name}>
          <Input
            value={formData.name}
            onChange={({ detail }) =>
              setFormData({ ...formData, name: detail.value })
            }
            placeholder="John Doe"
          />
        </FormField>

        <FormField label="Relationship" errorText={errors.relationship}>
          <Input
            value={formData.relationship}
            onChange={({ detail }) =>
              setFormData({ ...formData, relationship: detail.value })
            }
            placeholder="Parent, Spouse, Sibling, etc."
          />
        </FormField>

        <FormField
          label="Phone Number"
          errorText={errors.phone}
          description="Enter 10-digit phone number"
        >
          <Input
            value={formData.phone}
            onChange={({ detail }) => handlePhoneChange(detail.value)}
            placeholder="(318) 555-0123"
          />
        </FormField>

        <FormField label="Email Address (Optional)" errorText={errors.email}>
          <Input
            value={formData.email}
            onChange={({ detail }) =>
              setFormData({ ...formData, email: detail.value })
            }
            placeholder="contact@example.com"
            type="email"
          />
        </FormField>

        <Checkbox
          checked={formData.isPrimary}
          onChange={({ detail }) =>
            setFormData({ ...formData, isPrimary: detail.checked })
          }
        >
          Set as primary emergency contact
        </Checkbox>
      </SpaceBetween>
    </Modal>
  );
};

export default EmergencyContactModal;
