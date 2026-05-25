import { InputMask } from "primereact/inputmask";
import { useState } from "react";

function validateCpf(cpf) {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(clean[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(clean[10])) return false;

  return true;
}

export default function CpfInput({
  value,
  onChange,
  className,
  invalid,
  ...props
}) {
  const [touched, setTouched] = useState(false);
  const showError = touched && value && !validateCpf(value);

  return (
    <div>
      <InputMask
        mask="999.999.999-99"
        value={value}
        onChange={onChange}
        onBlur={() => setTouched(true)}
        className={`${className || ""} ${showError || invalid ? "p-invalid" : ""}`}
        autoComplete="new-password"
        name="cpf-field"
        {...props}
      />
      {showError && <small className="p-error">CPF inválido</small>}
    </div>
  );
}

export { validateCpf };
