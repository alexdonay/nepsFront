import { useRef, useState } from "react";
import {
  formatCNPJDigits,
  normalizeCNPJ,
  calculateCNPJCheckDigits,
  validateCNPJ,
} from "../services/utils";

/**
 * Componente de input para CNPJ com máscara automática
 * Formato: XX.XXX.XXX/XXXX-XX (14 dígitos)
 * Ex: 11.222.333/0001-81
 *
 * @param {string} value - Valor atual do CNPJ
 * @param {function} onChange - Função chamada quando o valor muda
 * @param {string} label - Label do campo
 * @param {boolean} required - Se o campo é obrigatório
 * @param {string} className - Classes CSS adicionais
 */
export default function CNPJInput({
  value = "",
  onChange,
  label = "CNPJ",
  required = false,
  className = "",
  ...props
}) {
  const inputRef = useRef(null);

  const displayValue = formatCNPJDigits(normalizeCNPJ(value));
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const input = e.target;
    const raw = input.value;
    const caret = input.selectionStart;

    const charsBefore = (raw.slice(0, caret).match(/[a-zA-Z0-9]/g) || [])
      .length;

    const d = normalizeCNPJ(raw);
    const formatted = formatCNPJDigits(d);

    let pos = formatted.length;
    let charsCount = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/[a-zA-Z0-9]/.test(formatted[i])) charsCount++;
      if (charsCount >= charsBefore) {
        pos = i + 1;
        break;
      }
    }

    // Call parent's onChange with normalized digits only
    const event = { ...e, target: { ...e.target, value: d } };
    if (onChange) onChange(event);

    // Validar CNPJ se tiver 14 dígitos
    if (d.length === 14) {
      if (!validateCNPJ(d)) {
        setError("CNPJ inválido. Verifique os dígitos.");
      } else {
        setError("");
      }
    } else {
      setError("");
    }

    // Restore caret after DOM update
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el && el.setSelectionRange) {
        el.setSelectionRange(pos, pos);
      }
    });
  };

  const handleAutoCalculate = () => {
    const normalized = normalizeCNPJ(value);
    if (normalized.length === 12) {
      const checkDigits = calculateCNPJCheckDigits(normalized);
      const fullCNPJ = normalized + checkDigits;
      const event = { target: { value: fullCNPJ } };
      if (onChange) onChange(event);
    }
  };

  return (
    <div className="field mb-3">
      {label && <label>{label}</label>}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={displayValue}
          onChange={handleChange}
          placeholder="XX.XXX.XXX/XXXX-XX"
          required={required}
          className={`p-inputtext w-full ${className}`}
          maxLength="18"
          {...props}
        />
        {normalizeCNPJ(value).length === 12 && (
          <button
            type="button"
            onClick={handleAutoCalculate}
            className="p-button p-button-sm p-button-info"
            title="Calcular dígito verificador"
          >
            <span className="pi pi-calculator"></span>
          </button>
        )}
      </div>
      <small className="block text-500 mt-1">Formato: XX.XXX.XXX/XXXX-XX</small>
      {error && <small className="block text-red-500 mt-1">{error}</small>}
    </div>
  );
}
