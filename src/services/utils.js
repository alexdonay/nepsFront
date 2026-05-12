/**
 * Utils de manipulação de telefone e CNPJ
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

export function normalizeCNPJ(value) {
  if (value == null) return "";
  return value
    .toString()
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
}

export function formatCNPJDigits(chars) {
  if (!chars) return "";
  const d = chars.toString().slice(0, 14);

  if (d.length === 0) return "";
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/**
 * Calcula o dígito verificador de um CNPJ
 * @param {string} cnpj - Os 12 primeiros dígitos do CNPJ
 * @returns {string} Os 2 dígitos verificadores
 */
export function calculateCNPJCheckDigits(cnpj) {
  const digits = cnpj.toString().replace(/\D/g, "").slice(0, 12);

  if (digits.length !== 12) return "";

  // Primeiro dígito verificador
  const firstMultipliers = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let firstSum = 0;
  for (let i = 0; i < 12; i++) {
    firstSum += parseInt(digits[i]) * firstMultipliers[i];
  }
  const firstRemainder = firstSum % 11;
  const firstCheck = firstRemainder < 2 ? 0 : 11 - firstRemainder;

  // Segundo dígito verificador
  const secondDigits = digits + firstCheck;
  const secondMultipliers = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let secondSum = 0;
  for (let i = 0; i < 13; i++) {
    secondSum += parseInt(secondDigits[i]) * secondMultipliers[i];
  }
  const secondRemainder = secondSum % 11;
  const secondCheck = secondRemainder < 2 ? 0 : 11 - secondRemainder;

  return `${firstCheck}${secondCheck}`;
}

/**
 * Valida um CNPJ completo
 * @param {string} cnpj - CNPJ completo com 14 dígitos
 * @returns {boolean} True se o CNPJ é válido, false caso contrário
 */
export function validateCNPJ(cnpj) {
  const digits = cnpj.toString().replace(/\D/g, "");

  // Deve ter exatamente 14 dígitos
  if (digits.length !== 14) return false;

  // Não pode ter todos os dígitos iguais
  if (/^(\d)\1{13}$/.test(digits)) return false;

  // Valida o primeiro dígito verificador
  const firstMultipliers = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let firstSum = 0;
  for (let i = 0; i < 12; i++) {
    firstSum += parseInt(digits[i]) * firstMultipliers[i];
  }
  const firstRemainder = firstSum % 11;
  const firstCheck = firstRemainder < 2 ? 0 : 11 - firstRemainder;

  if (parseInt(digits[12]) !== firstCheck) return false;

  // Valida o segundo dígito verificador
  const secondMultipliers = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let secondSum = 0;
  for (let i = 0; i < 13; i++) {
    secondSum += parseInt(digits[i]) * secondMultipliers[i];
  }
  const secondRemainder = secondSum % 11;
  const secondCheck = secondRemainder < 2 ? 0 : 11 - secondRemainder;

  if (parseInt(digits[13]) !== secondCheck) return false;

  return true;
}
