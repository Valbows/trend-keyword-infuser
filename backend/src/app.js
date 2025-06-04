const express = require('express');
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

// Import Routers
const trendRoutes = require('./routes/trendRoutes');
const scriptRoutes = require('./routes/scriptRoutes'); // Import script routes

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});

// API Routes
app.use('/api/v1/trends', trendRoutes);
app.use('/api/v1/scripts', scriptRoutes); // Use script routes

module.exports = app;
