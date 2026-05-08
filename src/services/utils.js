/**
 * Utils de manipulação de telefone
 */
export function normalizePhone(value) {
  if (value == null) return "";
  return value.toString().replace(/\D/g, "");
}

export function formatPhoneDigits(digits) {
  if (!digits) return "";
  const d = digits.toString();
  const area = d.slice(0, 2);
  if (d.length <= 2) return `(${area}`;
  if (d.length <= 6) return `(${area}) ${d.slice(2)}`;
  if (d.length <= 10) {
    const first = d.slice(2, 6);
    const second = d.slice(6);
    return second ? `(${area}) ${first}-${second}` : `(${area}) ${first}`;
  }
  const first5 = d.slice(2, 7);
  const second = d.slice(7, 11);
  return `(${area}) ${first5}-${second}`;
}
