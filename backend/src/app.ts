import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import mongoose from 'mongoose';

import cattleRoutes from './routes/cattleRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import vetReviewRoutes from './routes/vetReviewRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import datasetRoutes from './routes/datasetRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

export function createApp(): Application {
  const app = express();

  // Security headers (configured to permit audio streaming & cross-origin previews)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  // CORS configuration
  const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman) or matching list
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(null, true); // Dev-friendly fallback
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    })
  );

  // HTTP request logger
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Body parsers
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Static uploads directory for audio files
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
  app.use('/uploads', express.static(uploadDir));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    const mongoState = mongoose.connection.readyState;
    const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

    res.json({
      status: 'healthy',
      app: 'MooCare AI Backend',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: states[mongoState] || 'Unknown',
        connected: mongoState === 1,
        host: mongoose.connection.host || 'unknown',
        name: mongoose.connection.name || 'unknown',
      },
    });
  });

  // API Root documentation overview
  app.get('/api', (_req, res) => {
    res.json({
      name: 'MooCare AI Bioacoustic Health API',
      description: 'Production backend for cattle health, bioacoustic vocalization analysis & dataset ingestion',
      version: '1.0.0',
      endpoints: {
        health: 'GET /api/health',
        cattle: {
          list: 'GET /api/cattle',
          getById: 'GET /api/cattle/:id',
          create: 'POST /api/cattle',
          update: 'PUT /api/cattle/:id',
          delete: 'DELETE /api/cattle/:id',
        },
        scans: {
          list: 'GET /api/scans',
          getById: 'GET /api/scans/:id',
          createAnalysis: 'POST /api/scans',
          uploadAudio: 'POST /api/scans/upload',
        },
        alerts: {
          list: 'GET /api/alerts',
          resolve: 'PUT /api/alerts/:id/resolve',
          create: 'POST /api/alerts',
          dismiss: 'DELETE /api/alerts/:id',
        },
        vetReviews: {
          list: 'GET /api/vet-reviews',
          create: 'POST /api/vet-reviews',
          update: 'PUT /api/vet-reviews/:id',
        },
        farm: {
          profile: 'GET /api/farm/profile',
          updateProfile: 'PUT /api/farm/profile',
          stats: 'GET /api/farm/dashboard-stats',
        },
        dataset: {
          stats: 'GET /api/dataset/stats',
          samples: 'GET /api/dataset/samples',
          uploadFile: 'POST /api/dataset/upload (form-data: dataset file (.csv or .json))',
          importJson: 'POST /api/dataset/import-json',
          clear: 'DELETE /api/dataset/:datasetName',
        },
      },
    });
  });

  // Mount API routers
  app.use('/api/cattle', cattleRoutes);
  app.use('/api/scans', scanRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/vet-reviews', vetReviewRoutes);
  app.use('/api/farm', farmRoutes);
  app.use('/api/dataset', datasetRoutes);

  // Fallback 404 & error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
