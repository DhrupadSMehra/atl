import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// CORS setup
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Incoming Request Logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[HTTP ${req.method}] ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Mount Authentication Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ATL Website Auth API',
    timestamp: new Date().toISOString()
  });
});

// JSON 404 Handler for API routes
app.use('/api', (req: Request, res: Response) => {
  console.warn(`[404 Warning] API endpoint not found: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    success: false,
    error: `API endpoint '${req.method} ${req.originalUrl}' not found on server.`
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Initialize server
const startServer = async () => {
  console.log('==================================================');
  console.log('🚀 Starting ATL Website Express Backend Server...');

  const isMongoConnected = await connectDB();
  if (isMongoConnected) {
    console.log('✓ MongoDB Connected');
  } else {
    console.log('⚠ MongoDB Connection Failed - Operating in hybrid mode');
  }

  console.log('✓ Auth Routes Mounted at /api/auth');
  console.log('  └─ POST /api/auth/google');
  console.log('  └─ POST /api/auth/verify-admin-pass');
  console.log('  └─ GET  /api/auth/me');
  console.log('  └─ POST /api/auth/admin-setup');
  console.log('  └─ POST /api/auth/viewer-guest');

  app.listen(PORT, () => {
    console.log(`✓ Server Listening on http://localhost:${PORT}`);
    console.log('==================================================');
  });
};

startServer();
