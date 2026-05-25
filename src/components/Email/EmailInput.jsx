import { InputText } from "primereact/inputtext";
import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailInput({
  id = "email",
  label = "Email",
  value = "",
  onChange,
  required = false,
  invalidMessage = "Email inválido",
  className = "w-full",
  ...props
}) {
  const [touched, setTouched] = useState(false);
  const isInvalid = touched && value && !EMAIL_REGEX.test(value);

  return (
    <div className="field mb-3">
      <label htmlFor={id} className="block text-900 font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <InputText
        id={id}
        type="email"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={() => setTouched(true)}
        className={className}
        required={required}
        autoComplete="new-password"
        name={`${id}-field`}
        {...props}
      />
      {isInvalid && <small className="p-error">{invalidMessage}</small>}
    </div>
  );
}
