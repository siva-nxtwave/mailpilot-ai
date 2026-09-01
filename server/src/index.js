const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const config = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const emailRoutes = require('./routes/emailRoutes');
const aiRoutes = require('./routes/aiRoutes');
const activityRoutes = require('./routes/activityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server, config.CLIENT_URL);

// Security & utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// Helper to parse allowed origins from config.CLIENT_URL
const parseAllowedOrigins = () => {
  const urls = (config.CLIENT_URL || '').split(',').map((u) => u.trim().replace(/\/+$/, '')).filter(Boolean);
  if (!urls.includes('https://mailpilot.karthikeyantech.in')) {
    urls.push('https://mailpilot.karthikeyantech.in');
  }
  return urls;
};

const allowedOrigins = parseAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (like server-to-server, curl, mobile, health checks)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, '');

    // Allow configured production origins
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // In non-production environments, also allow localhost and 127.0.0.1
    if (config.NODE_ENV !== 'production' && (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1'))) {
      return callback(null, true);
    }

    // Reject all other unauthorized origins in production
    return callback(new Error(`Blocked by CORS policy: Origin ${origin} is not allowed.`));
  },
  credentials: true
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'MailPilot AI Server'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint ${req.originalUrl} does not exist.`
    }
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
  } catch (dbErr) {
    console.error('Initial DB connection attempt failed:', dbErr.message);
  }

  const port = process.env.PORT || config.PORT || 5001;
  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 MailPilot_AI Server running in ${config.NODE_ENV} mode on port ${port}`);
    console.log(`🔗 Health Check: http://localhost:${port}/api/health`);
  });
};

startServer();

module.exports = { app, server };
