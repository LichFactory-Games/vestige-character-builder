/**
 * Utility function to handle validation errors and prevent dialog closure.
 * @param {string} message - The error message to display.
 * @returns {boolean} - Returns false to prevent form submission and dialog closure.
 */
export function handleValidationError(message) {
  ui.notifications.error(message);
  return false; // Prevent dialog from closing
}
