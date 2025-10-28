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
} from "@cloudscape-design/components";
import { Phone } from "../types";

interface PhoneModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (phone: Omit<Phone, "id">) => Promise<boolean>;
  phone?: Phone;
  mode: "add" | "edit";
}

const PHONE_TYPES = [
  { label: "Mobile", value: "mobile" },
  { label: "Home", value: "home" },
  { label: "Work", value: "work" },
];

const PhoneModal: React.FC<PhoneModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  phone,
  mode,
}) => {
  const [formData, setFormData] = useState({
    type: "mobile" as Phone["type"],
    number: "",
    isPrimary: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (phone && mode === "edit") {
      setFormData({
        type: phone.type,
        number: phone.number,
        isPrimary: phone.isPrimary,
      });
    } else {
      setFormData({
        type: "mobile",
        number: "",
        isPrimary: false,
      });
    }
    setErrors({});
  }, [phone, mode, visible]);

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Format as (XXX) XXX-XXXX
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

    if (!formData.number.trim()) {
      newErrors.number = "Phone number is required";
    } else {
      const digits = formData.number.replace(/\D/g, "");
      if (digits.length !== 10) {
        newErrors.number = "Phone number must be 10 digits";
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

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData({ ...formData, number: formatted });
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={mode === "add" ? "Add Phone Number" : "Edit Phone Number"}
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
        <FormField label="Phone Type" errorText={errors.type}>
          <Select
            selectedOption={
              PHONE_TYPES.find((t) => t.value === formData.type) || null
            }
            onChange={({ detail }) =>
              setFormData({
                ...formData,
                type: detail.selectedOption.value as Phone["type"],
              })
            }
            options={PHONE_TYPES}
          />
        </FormField>

        <FormField
          label="Phone Number"
          errorText={errors.number}
          description="Enter 10-digit phone number"
        >
          <Input
            value={formData.number}
            onChange={({ detail }) => handlePhoneChange(detail.value)}
            placeholder="(318) 555-0123"
          />
        </FormField>

        <Checkbox
          checked={formData.isPrimary}
          onChange={({ detail }) =>
            setFormData({ ...formData, isPrimary: detail.checked })
          }
        >
          Set as primary phone number
        </Checkbox>
      </SpaceBetween>
    </Modal>
  );
};

export default PhoneModal;
