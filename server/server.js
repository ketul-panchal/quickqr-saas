import { createServer } from 'http';
import app from './src/app.js';
import config from './src/config/index.js';
import connectDB from './src/config/database.js';
import logger from './src/config/logger.js';
import { initializeSocket } from './src/sockets/index.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize Socket.io
    const io = initializeSocket(httpServer);
    
    // Make io accessible to routes/controllers
    app.set('io', io);
    
    // Start server
    httpServer.listen(config.port, () => {
      logger.info(`
        ################################################
        🚀 Server running in ${config.env} mode
        🔗 http://localhost:${config.port}
        📚 API Docs: http://localhost:${config.port}/api/v1/health
        🔌 Socket.io enabled
        ################################################
      `);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! Shutting down...', { error: err.message });
      httpServer.close(() => {
        process.exit(1);
      });
    });
    
    // Handle SIGTERM
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      httpServer.close(() => {
        logger.info('Process terminated');
      });
    });
    
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message });
    process.exit(1);
  }
};

startServer();
