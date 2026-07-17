'use strict';

const logger = require('./logger');

const original = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

function normalize(args) {
  if (args.length === 1 && args[0] && typeof args[0] === 'object') return args[0];
  return { message: args.map((value) => value instanceof Error ? value.message : String(value)).join(' ') };
}

console.log = (...args) => logger.info('console', normalize(args));
console.warn = (...args) => logger.warn('console', normalize(args));
console.error = (...args) => logger.error('console', normalize(args));

process.on('unhandledRejection', (reason) => {
  logger.error('unhandled_rejection', {
    error: reason instanceof Error ? { name: reason.name, message: reason.message, stack: reason.stack } : reason,
  });
});

process.on('uncaughtExceptionMonitor', (error, origin) => {
  logger.error('uncaught_exception', {
    origin,
    error: { name: error.name, message: error.message, stack: error.stack },
  });
});

logger.info('runtime_bootstrap', {
  node: process.version,
  pid: process.pid,
  release: process.env.RELEASE_ID || process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'development',
});

module.exports = { originalConsole: original };
