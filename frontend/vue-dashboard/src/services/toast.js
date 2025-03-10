/**
 * Toast Service for MukkaAI Dashboard
 * 
 * A simple toast notification service using Vue 3 compositions API.
 * Provides methods for displaying success, error, info, and warning toasts.
 */

import { reactive, toRefs } from 'vue';

// Toast state
const state = reactive({
  show: false,
  text: '',
  color: 'success',
  timeout: 5000,
  toasts: []
});

// Get current timestamp
const getTimestamp = () => new Date().getTime();

/**
 * Show a toast notification
 * @param {string} text Message to display
 * @param {string} color Color of the toast (success, error, info, warning)
 * @param {number} timeout Time in ms to show the toast
 */
function showToast(text, color = 'success', timeout = 5000) {
  const id = getTimestamp();
  
  // Add toast to queue
  state.toasts.push({
    id,
    text,
    color,
    timeout
  });
  
  // Auto remove toast after timeout
  setTimeout(() => {
    removeToast(id);
  }, timeout);
  
  // Return toast ID for potential manual dismissal
  return id;
}

/**
 * Remove a toast from the queue by ID
 * @param {number} id Toast ID to remove
 */
function removeToast(id) {
  const index = state.toasts.findIndex(toast => toast.id === id);
  if (index !== -1) {
    state.toasts.splice(index, 1);
  }
}

/**
 * Show a success toast
 * @param {string} text Message to display
 * @param {number} timeout Time in ms to show the toast
 */
function success(text, timeout = 5000) {
  return showToast(text, 'success', timeout);
}

/**
 * Show an error toast
 * @param {string} text Message to display
 * @param {number} timeout Time in ms to show the toast
 */
function error(text, timeout = 5000) {
  return showToast(text, 'error', timeout);
}

/**
 * Show an info toast
 * @param {string} text Message to display
 * @param {number} timeout Time in ms to show the toast
 */
function info(text, timeout = 5000) {
  return showToast(text, 'info', timeout);
}

/**
 * Show a warning toast
 * @param {string} text Message to display
 * @param {number} timeout Time in ms to show the toast
 */
function warning(text, timeout = 5000) {
  return showToast(text, 'warning', timeout);
}

// Export toast functions and reactive state
export default {
  ...toRefs(state),
  showToast,
  removeToast,
  success,
  error,
  info,
  warning
};
