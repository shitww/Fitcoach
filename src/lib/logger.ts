export const logger = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[INFO]', ...args);
    }
  },

  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WARN]', ...args);
    }
  },

  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  }
};