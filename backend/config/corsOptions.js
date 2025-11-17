const { URL } = require('url');

const baseAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.1.5:3000',
  'https://wepaste.vercel.app',
];

const envOrigin = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];

const allowedOrigins = [...new Set([...baseAllowedOrigins, ...envOrigin])];

const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
const allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'];
const exposedHeaders = ['Content-Length', 'Content-Type'];

const isLocalNetworkOrigin = (origin) => {
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname.startsWith('192.168.')) return true;
    if (hostname.startsWith('10.')) return true;
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) return true;
    return false;
  } catch (error) {
    return false;
  }
};

const isOriginAllowed = (origin) => {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;
  return isLocalNetworkOrigin(origin);
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS: Blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: allowedMethods,
  allowedHeaders,
  exposedHeaders,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

module.exports = {
  corsOptions,
  allowedOrigins,
  allowedMethods,
  allowedHeaders,
  exposedHeaders,
  isOriginAllowed,
};

