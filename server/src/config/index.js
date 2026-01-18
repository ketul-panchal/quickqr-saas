import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  
  mongoose: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/quickqr',
    options: {
      maxPoolSize: 10,
    },
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    accessExpirationMinutes: 30,
    refreshExpirationDays: 30,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    from: process.env.FROM_EMAIL || 'noreply@quickqr.com',
  },
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

export default config;