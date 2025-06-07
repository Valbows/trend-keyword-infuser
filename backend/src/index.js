require('dotenv').config(); 
process.on('uncaughtException', (error) => {
  console.error('!!! UNCAUGHT EXCEPTION (handler will not exit) !!!');
  console.error(error);
  // process.exit(1); // Temporarily disabled for diagnostics
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('!!! UNHANDLED PROMISE REJECTION (handler will not exit) !!!');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  // process.exit(1); // Temporarily disabled for diagnostics
});

const app = require('./app');

console.log(`[INDEX.JS] Current NODE_ENV: ${process.env.NODE_ENV}`);

const PORT = process.env.PORT || 3001; // Default to 3001 if no PORT env var

if (process.env.NODE_ENV !== 'test') { // Don't start server if in test environment
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Keep-alive check
  setInterval(() => {
    console.log('[INDEX.JS] Backend process still alive...');
  }, 5000);
}

module.exports = app; // Export app for testing or other modules if needed
