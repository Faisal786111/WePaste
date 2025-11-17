const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');
const contentRoutes = require('./routes/contentRoutes');
const cors = require('cors');
const { corsOptions } = require('./config/corsOptions');

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Express app
const app = express();

// Ensure Express respects X-Forwarded-* headers (needed on Render/Proxies)
app.set('trust proxy', 1);


// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());

// Global CORS configuration
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body Parser Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// More strict rate limiting for content creation
const createContentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 content creations per hour
  message: 'Too many content creation requests, please try again later.',
});
app.use('/api/createContent', createContentLimiter);

// Routes
app.use('/api', contentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WePaste API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;

