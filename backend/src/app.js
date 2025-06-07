const express = require('express');
const cors = require('cors');
const app = express();

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:3003', // Allow only your frontend to access
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

app.use(express.json()); // Middleware to parse JSON bodies

// Import Routers
const trendRoutes = require('./routes/trendRoutes');
const scriptRoutes = require('./routes/scriptRoutes'); // Import script routes

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is healthy' });
});

// API Routes
app.use('/api/v1/trends', (req, res, next) => {
  console.log(`[APP.JS] Request received for: ${req.method} ${req.originalUrl}`);
  next();
}, trendRoutes);
app.use('/api/v1/scripts', scriptRoutes); // Use script routes

module.exports = app;
