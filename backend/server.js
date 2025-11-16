const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');
const contentRoutes = require('./routes/contentRoutes');

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());

// CORS Configuration
// Allowed origins: localhost and local network IPs
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.1.5:3000',
  // Allow custom frontend URL from environment variable if provided
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

// Helper function to check if origin is in LAN (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
const isLocalNetwork = (origin) => {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    // Check for localhost variants
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    // Check for private network ranges
    if (hostname.startsWith('192.168.')) return true;
    if (hostname.startsWith('10.')) return true;
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) return true;
    return false;
  } catch (e) {
    return false;
  }
};

// Remove duplicates
const uniqueOrigins = [...new Set(allowedOrigins)];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (uniqueOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } 
      // Check if origin is from local network (LAN)
      else if (isLocalNetwork(origin)) {
        // Allow if it's on port 3000 (React dev server)
        if (origin.includes(':3000')) {
          callback(null, true);
        } else {
          console.warn(`CORS: Blocked LAN request from origin: ${origin} (not on port 3000)`);
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        console.warn(`CORS: Blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies and authentication headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400, // 24 hours - cache preflight requests
  })
);

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

