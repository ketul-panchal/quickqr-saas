import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[36m',  // Cyan
  http: '\x1b[35m',  // Magenta
  debug: '\x1b[32m', // Green
  reset: '\x1b[0m',
};

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, message, meta = {}) => {
  const timestamp = getTimestamp();
  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${metaString}`;
};

const writeToFile = (level, formattedMessage) => {
  const logFile = path.join(logsDir, `${level}.log`);
  const combinedLog = path.join(logsDir, 'combined.log');
  
  fs.appendFileSync(logFile, formattedMessage + '\n');
  fs.appendFileSync(combinedLog, formattedMessage + '\n');
};

const log = (level, message, meta = {}) => {
  const currentLevel = process.env.LOG_LEVEL || 'debug';
  
  if (levels[level] <= levels[currentLevel]) {
    const formattedMessage = formatMessage(level, message, meta);
    
    // Console output with colors
    console.log(`${colors[level]}${formattedMessage}${colors.reset}`);
    
    // File output (production)
    if (process.env.NODE_ENV === 'production') {
      writeToFile(level, formattedMessage);
    }
  }
};

const logger = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  http: (message, meta) => log('http', message, meta),
  debug: (message, meta) => log('debug', message, meta),
};

export default logger;