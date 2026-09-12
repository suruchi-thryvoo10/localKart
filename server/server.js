import app from './src/app.js';
import { config } from './src/config/index.js';
import { connectDB, closeDB } from './src/config/db.js';
import { logger } from './src/utils/logger.js';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      logger.info(`=================================================`);
      logger.info(`  🚀 LocalKart Hyperlocal API running on port ${config.port}`);
      logger.info(`  🌍 Environment: ${config.nodeEnv}`);
      logger.info(`  🩺 Health Check: http://localhost:${config.port}/health`);
      logger.info(`=================================================`);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await closeDB();
        process.exit(0);
      });

      // Force close after 10s if hung
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
