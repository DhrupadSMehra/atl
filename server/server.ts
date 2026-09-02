import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import noticeRoutes from './routes/notices';
import memberRoutes from './routes/members';
import stayBackRoutes from './routes/staybacks';
import communityRoutes from './routes/community';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5175;

// COOP header to support Google OAuth popups without window.closed policy warnings
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// CORS setup
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5175'],
  credentials: true
}));

app.use(express.json());

// Incoming Request Logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[HTTP ${req.method}] ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Mount Authentication Routes
app.use('/api/auth', authRoutes);

// Mount Member Routes
app.use('/api/members', memberRoutes);

// Mount Notice Board Routes
app.use('/api/notices', noticeRoutes);

// Mount StayBack Routes
app.use('/api/staybacks', stayBackRoutes);

// Mount Community Routes
app.use('/api/community', communityRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ATL Website Express Backend',
  });
});
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

app.post('/api/log-error', (req: Request, res: Response) => {
  console.error('[FRONTEND ERROR]', req.body);
  res.sendStatus(200);
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
  console.log('✓ Notice Routes Mounted at /api/notices');
  console.log('  └─ GET    /api/notices');
  console.log('  └─ GET    /api/notices/:id');
  console.log('  └─ POST   /api/notices');
  console.log('  └─ PUT    /api/notices/:id');
  console.log('  └─ DELETE /api/notices/:id');
  console.log('  └─ PATCH  /api/notices/:id/pin');
  console.log('  └─ PATCH  /api/notices/:id/status');
  console.log('  └─ POST   /api/notices/:id/duplicate');
  console.log('✓ Static Uploads served at /uploads');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server Listening on http://0.0.0.0:${PORT}`);
    console.log('==================================================');
  });
};

startServer();
