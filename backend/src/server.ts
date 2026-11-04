import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

async function bootstrap() {
  try {
    console.log('[MooCare AI] Starting server initialization...');

    // Connect to MongoDB
    await connectDB();

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 MooCare AI Backend is running on http://localhost:${PORT}`);
      console.log(`📡 Health Check:  http://localhost:${PORT}/api/health`);
      console.log(`📖 API Directory: http://localhost:${PORT}/api`);
      console.log(`📊 Dataset Stats: http://localhost:${PORT}/api/dataset/stats`);
      console.log(`📁 Uploads dir:   ${process.env.UPLOAD_DIR || './uploads'}`);
      console.log(`======================================================\n`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        try {
          await disconnectDB();
          process.exit(0);
        } catch (err) {
          console.error('[Server] Error disconnecting database during shutdown:', err);
          process.exit(1);
        }
      });

      // Force terminate if graceful shutdown hangs
      setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Fatal] Server failed to start:', error);
    process.exit(1);
  }
}

bootstrap();
