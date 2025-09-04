import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';

// Import routes
import visitorRoutes from './routes/visitors';
import visitRoutes from './routes/visits';
import reportRoutes from './routes/reports';
import userRoutes from './routes/users';
import maintenanceRoutes from './routes/maintenance';

// Import configuration
import { connectDB } from './config/database';
import { createTables } from './config/init-db';
import { FileService } from './services/FileService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan('combined'));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Visit Control System API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/visitors', visitorRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Departments endpoint
app.get('/api/departments', async (req, res) => {
  try {
    const query = `
      SELECT id, name, description, access_level as "accessLevel", 
             is_active as "isActive", created_at as "createdAt"
      FROM departments 
      WHERE is_active = true
      ORDER BY access_level, name
    `;
    
    const pool = (await import('./config/database')).default;
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting departments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get departments'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large. Maximum size is 10MB'
    });
  }
  
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Initialize server
async function startServer() {
  try {
    // Connect to database
    await connectDB();
    
    // Create tables if they don't exist
    await createTables();
    
    // Ensure upload directories exist
    FileService.ensureUploadDirs();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Visit Control System API running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}