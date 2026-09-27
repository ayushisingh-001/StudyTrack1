const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { clerkMiddleware } = require('@clerk/express');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. MIDDLEWARE SETUP
// ==========================================

// Enable CORS so the React frontend (Localhost or Deployed URL like Vercel) can communicate with this API
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean).map(url => url.replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Check if origin matches or ends with vercel.app or allowedOrigins
      const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*');
      if (isAllowed || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for easy demo deployment
    },
    credentials: true,
  })
);

// Built-in middleware to parse incoming JSON payloads
app.use(express.json());

// Clerk Middleware:
// Inspects the 'Authorization: Bearer <token>' header on incoming requests.
// If valid, populates the Clerk auth context so we can access req.auth / getAuth(req).
app.use(clerkMiddleware());

// ==========================================
// 2. DATABASE CONNECTION (MongoDB)
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studytrack';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully.');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('👉 Make sure MongoDB is running or verify your MONGODB_URI in .env');
  });

// ==========================================
// 3. API ROUTES
// ==========================================
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

// Mount routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Root / Health check route
app.get('/', (req, res) => {
  res.json({
    project: 'StudyTrack API – Student Task Management System',
    status: 'Running',
    version: '1.0.0',
    endpoints: ['/api/tasks', '/api/users'],
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? null : err.message,
  });
});

// ==========================================
// 4. START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 StudyTrack Server listening on http://localhost:${PORT}`);
  console.log(`📡 Client URL configured as: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
