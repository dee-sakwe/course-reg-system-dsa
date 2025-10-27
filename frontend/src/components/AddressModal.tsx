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
import { Address } from "../types";

interface AddressModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (address: Omit<Address, "id">) => Promise<boolean>;
  address?: Address;
  mode: "add" | "edit";
}

const ADDRESS_TYPES = [
  { label: "Home", value: "home" },
  { label: "Campus", value: "campus" },
  { label: "Permanent", value: "permanent" },
  { label: "Mailing", value: "mailing" },
];

const AddressModal: React.FC<AddressModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  address,
  mode,
}) => {
  const [formData, setFormData] = useState({
    type: "home" as Address["type"],
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    isPrimary: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (address && mode === "edit") {
      setFormData({
        type: address.type,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        isPrimary: address.isPrimary,
      });
    } else {
      setFormData({
        type: "home",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
        isPrimary: false,
      });
    }
    setErrors({});
  }, [address, mode, visible]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.street.trim()) {
      newErrors.street = "Street address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Invalid ZIP code format";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
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
      header={mode === "add" ? "Add Address" : "Edit Address"}
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
        <FormField label="Address Type" errorText={errors.type}>
          <Select
            selectedOption={
              ADDRESS_TYPES.find((t) => t.value === formData.type) || null
            }
            onChange={({ detail }) =>
              setFormData({
                ...formData,
                type: detail.selectedOption.value as Address["type"],
              })
            }
            options={ADDRESS_TYPES}
          />
        </FormField>

        <FormField label="Street Address" errorText={errors.street}>
          <Input
            value={formData.street}
            onChange={({ detail }) =>
              setFormData({ ...formData, street: detail.value })
            }
            placeholder="403 Main St"
          />
        </FormField>

        <FormField label="City" errorText={errors.city}>
          <Input
            value={formData.city}
            onChange={({ detail }) =>
              setFormData({ ...formData, city: detail.value })
            }
            placeholder="Grambling"
          />
        </FormField>

        <FormField label="State" errorText={errors.state}>
          <Input
            value={formData.state}
            onChange={({ detail }) =>
              setFormData({ ...formData, state: detail.value })
            }
            placeholder="LA"
          />
        </FormField>

        <FormField label="ZIP Code" errorText={errors.zipCode}>
          <Input
            value={formData.zipCode}
            onChange={({ detail }) =>
              setFormData({ ...formData, zipCode: detail.value })
            }
            placeholder="71245"
          />
        </FormField>

        <FormField label="Country" errorText={errors.country}>
          <Input
            value={formData.country}
            onChange={({ detail }) =>
              setFormData({ ...formData, country: detail.value })
            }
            placeholder="USA"
          />
        </FormField>

        <Checkbox
          checked={formData.isPrimary}
          onChange={({ detail }) =>
            setFormData({ ...formData, isPrimary: detail.checked })
          }
        >
          Set as primary address
        </Checkbox>
      </SpaceBetween>
    </Modal>
  );
};

export default AddressModal;
