// Leveled logging wrapper. Application code must log through this module
// instead of calling console directly, so verbosity is controlled in one
// place and can be raised for a support session without a code change.
//
// Level comes from VITE_LOG_LEVEL (baked in at build time, same as the rest
// of the Vite env). Unset, it defaults to 'debug' in dev builds and 'error'
// in production ones -- errors stay visible everywhere; chatter does not.

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function parseLevel(name) {
  return name && String(name).toLowerCase() in LEVELS ? LEVELS[String(name).toLowerCase()] : null;
}

// `sink` exists so tests can pass a fake console instead of stubbing globals.
export function createLogger({ minLevel, sink } = {}) {
  const fallback = import.meta.env.DEV ? LEVELS.debug : LEVELS.error;
  const threshold = parseLevel(minLevel ?? import.meta.env.VITE_LOG_LEVEL) ?? fallback;
  const out = sink || console;

  const emit = (level) => (...args) => {
    if (LEVELS[level] < threshold) return;
    (out[level] || console.error.bind(console))(
      new Date().toISOString(),
      `[${level}]`,
      ...args,
    );
  };

  return { debug: emit('debug'), info: emit('info'), warn: emit('warn'), error: emit('error') };
}

export const logger = createLogger();
export default logger;
