const app = require('./app');
require('dotenv').config(); // Load environment variables

const PORT = process.env.PORT || 3001; // Default to 3001 if no PORT env var

if (process.env.NODE_ENV !== 'test') { // Don't start server if in test environment
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; // Export app for testing or other modules if needed
