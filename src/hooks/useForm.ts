import { useState } from "react";

type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export const useForm = <T extends object>(initialValues: T) => {
  const [formData, setFormData] = useState<T>(initialValues);

  const handleChange = (e: React.ChangeEvent<FormElement>) => {
    const target = e.target;
    const { name, type, value } = target;

    let newValue: unknown = value;

    if (target instanceof HTMLInputElement && type === "checkbox") {
      newValue = target.checked;
    }

    if (target instanceof HTMLSelectElement && target.multiple) {
      newValue = Array.from(target.options)
        .filter(option => option.selected)
        .map(option => option.value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  return { formData, handleChange, setFormData };
};
