import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from '../config/logger.js';
import Restaurant from '../models/restaurant.model.js';

let io = null;

/**
 * Initialize Socket.io server
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {Server} Socket.io server instance
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.id;
      socket.user = decoded;
      
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error.message);
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', async (socket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join restaurant rooms for owned restaurants
    try {
      const restaurants = await Restaurant.find({ owner: socket.userId }).select('_id');
      restaurants.forEach((restaurant) => {
        socket.join(`restaurant:${restaurant._id}`);
        logger.info(`User ${socket.userId} joined restaurant room: ${restaurant._id}`);
      });
    } catch (error) {
      logger.error('Error joining restaurant rooms:', error.message);
    }

    // Handle manual room join (for dynamic restaurant subscriptions)
    socket.on('join:restaurant', (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
      logger.info(`User ${socket.userId} manually joined restaurant room: ${restaurantId}`);
    });

    // Handle room leave
    socket.on('leave:restaurant', (restaurantId) => {
      socket.leave(`restaurant:${restaurantId}`);
      logger.info(`User ${socket.userId} left restaurant room: ${restaurantId}`);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.userId}, reason: ${reason}`);
    });

    // Send connection confirmation
    socket.emit('connected', { message: 'Connected to QuickQR notifications' });
  });

  logger.info('Socket.io initialized successfully');
  return io;
};

/**
 * Get the Socket.io instance
 * @returns {Server|null} Socket.io server instance
 */
export const getIO = () => {
  if (!io) {
    logger.warn('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit event to a specific restaurant room
 * @param {string} restaurantId - Restaurant ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
export const emitToRestaurant = (restaurantId, event, data) => {
  if (io) {
    io.to(`restaurant:${restaurantId}`).emit(event, data);
    logger.info(`Emitted ${event} to restaurant: ${restaurantId}`);
  }
};

/**
 * Emit event to a specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
    logger.info(`Emitted ${event} to user: ${userId}`);
  }
};

export default { initializeSocket, getIO, emitToRestaurant, emitToUser };
