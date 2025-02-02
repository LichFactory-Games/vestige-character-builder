/**
 * Utility function to handle validation errors and prevent dialog closure.
 * @param {string} message - The error message to display.
 * @returns {boolean} - Returns false to prevent form submission and dialog closure.
 */

export function handleValidationError(message) {
  console.error("Validation error:", message);
  ui.notifications.error(message);
  return false; // Return false to prevent dialog closure
}

export function validateNumericInput(value, min, max, fieldName) {
  const num = parseInt(value);
  if (isNaN(num) || num < min || num > max) {
    handleValidationError(`${fieldName} must be between ${min} and ${max}`);
    return false;
  }
  return num;
}
