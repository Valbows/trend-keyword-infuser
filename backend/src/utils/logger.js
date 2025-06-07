// backend/src/utils/logger.js

/**
 * Logs an informational message to the console.
 * @param {...any} args - Arguments to log.
 */
const info = (...args) => {
  console.log('[INFO]', ...args);
};

/**
 * Logs an error message to the console.
 * @param {...any} args - Arguments to log as an error.
 */
const error = (...args) => {
  console.error('[ERROR]', ...args);
};

/**
 * Logs a warning message to the console.
 * @param {...any} args - Arguments to log as a warning.
 */
const warn = (...args) => {
  console.warn('[WARN]', ...args);
};

/**
 * Logs a debug message to the console. (Could be conditional based on environment later)
 * @param {...any} args - Arguments to log as debug information.
 */
const debug = (...args) => {
  // For now, let's make debug logs appear like info logs.
  // In the future, this could be tied to an environment variable.
  console.log('[DEBUG]', ...args);
};

module.exports = {
  info,
  error,
  warn,
  debug,
};
