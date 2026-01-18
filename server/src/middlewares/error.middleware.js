import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';
import config from '../config/index.js';

/**
 * Convert non-ApiError to ApiError
 */
const errorConverter = (err, req, res, next) => {
  let error = err;
  
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  
  next(error);
};

/**
 * Handle errors and send response
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  // In production, don't expose internal errors
  if (config.env === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }
  
  // Log error
  logger.error(message, {
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  const response = {
    success: false,
    statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };
  
  res.status(statusCode).json(response);
};

/**
 * Handle 404 Not Found
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

export { errorConverter, errorHandler, notFoundHandler };