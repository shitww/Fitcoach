function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info: (...args: any[]) => {
    console.log(`[INFO ${timestamp()}]`, ...args);
  },

  warn: (...args: any[]) => {
    console.warn(`[WARN ${timestamp()}]`, ...args);
  },

  error: (...args: any[]) => {
    console.error(`[ERROR ${timestamp()}]`, ...args);
  },

  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG ${timestamp()}]`, ...args);
    }
  },
};