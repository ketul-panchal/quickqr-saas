import app from './src/app.js';
import config from './src/config/index.js';
import connectDB from './src/config/database.js';
import logger from './src/config/logger.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`
        ################################################
        🚀 Server running in ${config.env} mode
        🔗 http://localhost:${config.port}
        📚 API Docs: http://localhost:${config.port}/api/v1/health
        ################################################
      `);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! Shutting down...', { error: err.message });
      server.close(() => {
        process.exit(1);
      });
    });
    
    // Handle SIGTERM
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
      });
    });
    
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message });
    process.exit(1);
  }
};

startServer();