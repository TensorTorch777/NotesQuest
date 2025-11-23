// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const aiRoutes = require('./routes/ai');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// If you ever put this behind a proxy (Cloudflare/nginx), keep real client IPs
app.set('trust proxy', 1);

/* =========================
   CORS (place FIRST)
   ========================= */
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5175'
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
// Ensure every preflight gets the right headers
app.options('*', cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5175'
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

/* =========================
   Security headers (after CORS)
   ========================= */
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow cross-origin fetch of API responses
    crossOriginEmbedderPolicy: false, // avoid COEP issues for some clients
  })
);

/* =========================
   Rate limiting
   ========================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

/* =========================
   Body parsers
   ========================= */
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

/* =========================
   Routes
   ========================= */
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);

/* =========================
   Health check
   ========================= */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

/* =========================
   Error handler
   ========================= */
app.use((err, req, res, next) => {
  // If the error came from CORS origin callback, respond cleanly
  if (err && /CORS blocked/.test(String(err.message))) {
    return res.status(403).json({
      error: 'CORS_ERROR',
      message: err.message,
      allowedOrigins: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://localhost:5175'
      ],
    });
  }

  console.error(err.stack || err);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message || 'Internal server error'
        : 'Internal server error',
  });
});

/* =========================
   404 handler
   ========================= */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* =========================
   Bootstrap
   ========================= */
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      const env = process.env.NODE_ENV || 'development';
      const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
      const ai = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      console.log(`🚀 NoteQuest Backend running on port ${PORT}`);
      console.log(`📚 Environment: ${env}`);
      console.log(`🔗 Frontend URL: ${frontend}`);
      console.log(`🤖 AI Service URL: ${ai}`);
      console.log(`✅ CORS allowed origins: ${[frontend, 'http://localhost:5173', 'http://localhost:5175'].join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
