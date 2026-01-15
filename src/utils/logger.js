const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const getColor = (level) => {
  switch (level) {
    case 'ERROR':
      return colors.red;
    case 'WARN':
      return colors.yellow;
    case 'INFO':
      return colors.green;
    case 'DEBUG':
      return colors.cyan;
    default:
      return colors.reset;
  }
};

const logger = {
  info: (message) => {
    const timestamp = new Date().toISOString();
    const color = process.env.NODE_ENV === 'production' ? '' : getColor('INFO');
    const reset = process.env.NODE_ENV === 'production' ? '' : colors.reset;
    console.log(`${color}[INFO]${reset} ${timestamp} - ${message}`);
  },
  error: (message) => {
    const timestamp = new Date().toISOString();
    const color = process.env.NODE_ENV === 'production' ? '' : getColor('ERROR');
    const reset = process.env.NODE_ENV === 'production' ? '' : colors.reset;
    console.error(`${color}[ERROR]${reset} ${timestamp} - ${message}`);
  },
  warn: (message) => {
    const timestamp = new Date().toISOString();
    const color = process.env.NODE_ENV === 'production' ? '' : getColor('WARN');
    const reset = process.env.NODE_ENV === 'production' ? '' : colors.reset;
    console.warn(`${color}[WARN]${reset} ${timestamp} - ${message}`);
  },
  debug: (message) => {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      const timestamp = new Date().toISOString();
      const color = getColor('DEBUG');
      const reset = colors.reset;
      console.log(`${color}[DEBUG]${reset} ${timestamp} - ${message}`);
    }
  },
};

module.exports = logger;


