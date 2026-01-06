/**
 * Logging Utility
 */

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  magenta: '\x1b[35m',
};

class Logger {
  constructor(prefix = '') {
    this.prefix = prefix;
    this.silent = false;
  }

  info(message, ...args) {
    if (!this.silent) {
      console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${this.prefix}${message}`, ...args);
    }
  }

  success(message, ...args) {
    if (!this.silent) {
      console.log(`${COLORS.green}✓${COLORS.reset} ${this.prefix}${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (!this.silent) {
      console.warn(`${COLORS.yellow}⚠${COLORS.reset} ${this.prefix}${message}`, ...args);
    }
  }

  error(message, ...args) {
    if (!this.silent) {
      console.error(`${COLORS.red}✗${COLORS.reset} ${this.prefix}${message}`, ...args);
    }
  }

  debug(message, ...args) {
    if (process.env.DEBUG && !this.silent) {
      console.log(`${COLORS.blue}DEBUG${COLORS.reset} ${this.prefix}${message}`, ...args);
    }
  }

  setSilent(silent) {
    this.silent = silent;
  }
}

export default Logger;
