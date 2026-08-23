import { describe, expect, it, vi } from 'vitest';
import { createLogger } from '../logger';

function fakeSink() {
  return { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

describe('createLogger', () => {
  it('emits every level when the threshold is debug', () => {
    const sink = fakeSink();
    const logger = createLogger({ minLevel: 'debug', sink });

    logger.debug('a');
    logger.info('b');
    logger.warn('c');
    logger.error('d');

    expect(sink.debug).toHaveBeenCalledTimes(1);
    expect(sink.info).toHaveBeenCalledTimes(1);
    expect(sink.warn).toHaveBeenCalledTimes(1);
    expect(sink.error).toHaveBeenCalledTimes(1);
  });

  it('suppresses levels below the threshold', () => {
    const sink = fakeSink();
    const logger = createLogger({ minLevel: 'warn', sink });

    logger.debug('hidden');
    logger.info('hidden');
    logger.warn('shown');
    logger.error('shown');

    expect(sink.debug).not.toHaveBeenCalled();
    expect(sink.info).not.toHaveBeenCalled();
    expect(sink.warn).toHaveBeenCalledTimes(1);
    expect(sink.error).toHaveBeenCalledTimes(1);
  });

  it('treats an unknown level as unset and falls back to the default threshold', () => {
    const sink = fakeSink();
    // DEV builds default to 'debug', so info must come through.
    const logger = createLogger({ minLevel: 'loud', sink });

    logger.info('fallback threshold');
    expect(sink.info).toHaveBeenCalled();
  });

  it('is case-insensitive about level names', () => {
    const sink = fakeSink();
    const logger = createLogger({ minLevel: 'ERROR', sink });

    logger.warn('hidden');
    logger.error('shown');

    expect(sink.warn).not.toHaveBeenCalled();
    expect(sink.error).toHaveBeenCalled();
  });

  it('prefixes every entry with a timestamp and the level tag', () => {
    const sink = fakeSink();
    const logger = createLogger({ minLevel: 'debug', sink });

    logger.warn('payload', { code: 42 });

    const [prefix, tag] = sink.warn.mock.calls[0];
    expect(prefix).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(tag).toBe('[warn]');
    expect(sink.warn).toHaveBeenLastCalledWith(expect.any(String), '[warn]', 'payload', { code: 42 });
  });

  it('routes a suppressed-sink method through console.error rather than dropping the entry', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const logger = createLogger({ minLevel: 'error', sink: {} });
      logger.error('only error goes anywhere');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.any(String),
        '[error]',
        'only error goes anywhere',
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
