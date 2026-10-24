import express from 'express';
import documentRoutes from './document.routes.js';
import authRoutes from './auth.routes.js';
import speechRoutes from './speech.routes.js';
import sessionRoutes from './session.routes.js';
import { getGroqStatus, testGroqConnection } from '../services/groq.service.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Dyslexia-Friendly Reading Assistant API'
  });
});

// Groq configuration status check (safe, does not expose secret key)
router.get('/groq/status', (req, res) => {
  res.json({
    success: true,
    ...getGroqStatus()
  });
});

// Groq connectivity test endpoint (minimal ping, run on explicit trigger)
router.post('/groq/test', async (req, res) => {
  try {
    const result = await testGroqConnection();
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      code: error.code || 'GROQ_TEST_FAILED',
      error: error.message || 'Groq connection test failed'
    });
  }
});

// Mount domain routes
router.use('/documents', documentRoutes);
router.use('/auth', authRoutes);
router.use('/speech', speechRoutes);
router.use('/sessions', sessionRoutes);

export default router;

