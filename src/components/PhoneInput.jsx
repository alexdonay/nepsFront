import { useRef } from "react";
import { normalizePhone, formatPhoneDigits } from "../services/utils";

export default function PhoneInput({
  value = "",
  onChange,
  label = "Telefone",
  required = false,
  className = "",
  ...props
}) {
  const inputRef = useRef(null);

  const formatByDigits = formatPhoneDigits;

  const displayValue = formatByDigits(normalizePhone(value));

  const handleChange = (e) => {
    const input = e.target;
    const raw = input.value;
    const caret = input.selectionStart;

    // Count digits before caret
    const digitsBefore = (raw.slice(0, caret).match(/\d/g) || []).length;

    const d = normalizePhone(raw);
    const formatted = formatByDigits(d);

    // Compute new caret position based on digitsBefore
    let pos = formatted.length;
    let digitsCount = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) digitsCount++;
      if (digitsCount >= digitsBefore) {
        pos = i + 1;
        break;
      }
    }

    // Call parent's onChange with normalized digits only
    const event = { ...e, target: { ...e.target, value: d } };
    if (onChange) onChange(event);

    // Restore caret after DOM update
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el && el.setSelectionRange) {
        el.setSelectionRange(pos, pos);
      }
    });
  };

  return (
    <div className="field mb-3">
      {label && <label>{label}</label>}
      <input
        ref={inputRef}
        value={displayValue}
        onChange={handleChange}
        placeholder="(XX) XXXX-XXXX"
        required={required}
        className={`p-inputtext w-full ${className}`}
        {...props}
      />
      <small className="block text-500 mt-1">
        Fixo: (XX) XXXX-XXXX | Celular: (XX) XXXXX-XXXX
      </small>
    </div>
  );
}
