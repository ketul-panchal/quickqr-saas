// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import compression from 'compression';
// import morgan from 'morgan';
// import cookieParser from 'cookie-parser';
// import rateLimit from 'express-rate-limit';
// import mongoSanitize from 'express-mongo-sanitize';

// import config from './config/index.js';
// import logger from './config/logger.js';
// import v1Routes from './routes/v1/index.js';
// import { errorConverter, errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

// const app = express();

// // Trust proxy (for rate limiting behind reverse proxy)
// app.set('trust proxy', 1);

// // Security middleware
// app.use(helmet());

// // CORS
// app.use(cors(config.cors));
// app.options('*', cors(config.cors));

// // Body parser
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Cookie parser
// app.use(cookieParser(config.jwt.secret));

// // Sanitize data
// app.use(mongoSanitize());

// // Compression
// app.use(compression());

// // Request logging
// if (config.env !== 'test') {
//   app.use(morgan('combined', {
//     stream: { write: (message) => logger.http(message.trim()) },
//   }));
// }

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many requests, please try again later.',
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use('/api', limiter);

// // API routes
// app.use('/api/v1', v1Routes);

// // Health check (root)
// app.get('/', (req, res) => {
//   res.json({
//     success: true,
//     message: 'QuickQR API Server',
//     version: '1.0.0',
//     docs: '/api/v1/health',
//   });
// });

// // 404 handler
// app.use(notFoundHandler);

// // Error handling
// app.use(errorConverter);
// app.use(errorHandler);

// export default app;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import logger from './config/logger.js';
import v1Routes from './routes/v1/index.js';
import { errorConverter, errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors(config.cors));
app.options('*', cors(config.cors));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser(config.jwt.secret));

// Sanitize data
app.use(mongoSanitize());

// Compression
app.use(compression());

// Request logging
if (config.env !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
  }));
}

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// API routes
app.use('/api/v1', v1Routes);

// Health check (root)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'QuickQR API Server',
    version: '1.0.0',
    docs: '/api/v1/health',
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorConverter);
app.use(errorHandler);

export default app;