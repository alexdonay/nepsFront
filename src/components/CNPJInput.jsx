import { useRef } from "react";
import { normalizePhone, formatPhoneDigits } from "../services/utils";

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
export default function CNPJInput({ value = "", onChange, label = "CNPJ", required = false, className = "", ...props }) {
  const inputRef = useRef(null);

  const normalizeCNPJ = (v) => (v || "").toString().replace(/\D/g, "");

  const formatCNPJDigits = (digits) => {
    if (!digits) return "";
    const d = digits.toString().slice(0, 14); // CNPJ tem exatamente 14 dígitos

    if (d.length === 0) return "";
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
    if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  };

  const displayValue = formatCNPJDigits(normalizeCNPJ(value));

  const handleChange = (e) => {
    const input = e.target;
    const raw = input.value;
    const caret = input.selectionStart;

    // Count digits before caret
    const digitsBefore = (raw.slice(0, caret).match(/\d/g) || []).length;

    const d = normalizeCNPJ(raw);
    const formatted = formatCNPJDigits(d);

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
        placeholder="XX.XXX.XXX/XXXX-XX"
        required={required}
        className={`p-inputtext w-full ${className}`}
        maxLength="18"
        {...props}
      />
      <small className="block text-500 mt-1">Formato: XX.XXX.XXX/XXXX-XX</small>
    </div>
  );
}
