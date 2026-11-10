/**
 * Polyfill for `process` in WebExtensions / browser context.
 */
const proc = {
  env: {
    PASSBOLT_DEBUG: 'false',
    PASSBOLT_LOG_LEVEL: '0',
    PASSBOLT_LOG_CONSOLE: 'false',
  },
  browser: true,
  version: '',
  versions: {},
  nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0),
};

if (typeof globalThis.process === 'undefined') {
  globalThis.process = proc;
}

module.exports = proc;
