// backend/lib/helpers.js

/**
 * Sirf digits return karega (remove all non-digits)
 * @param {string} str - Input string
 * @returns {string} - Only digits
 */
 export const onlyDigits = (str) => {
  if (!str) return "";
  return String(str).replace(/\D/g, "");
};

/**
 * Safe number conversion
 * @param {any} value - Value to convert to number
 * @returns {number} - Converted number or 0
 */
export const toNumber = (value) => {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

// Export for backend (Node.js)
