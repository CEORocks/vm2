import { describe, it, expect } from 'vitest';
import { Logger } from '../../src/utils/logger';

describe('Logger', () => {
  it('records logs and filters based on level', () => {
    const logger = new Logger({ level: 'warn', prefix: 'TestLog' });
    logger.debug('debug message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');

    const logs = logger.getLogs();
    expect(logs.length).toBe(4); // logs are recorded in memory
    expect(logs[0].level).toBe('debug');
    expect(logs[2].level).toBe('warn');
  });

  it('creates child loggers with combined prefix', () => {
    const parent = new Logger({ prefix: 'Parent' });
    const child = parent.child('Child');
    child.info('child log');

    const childLogs = child.getLogs();
    expect(childLogs.length).toBe(1);
    expect(childLogs[0].message).toBe('child log');
  });

  it('can clear logs and toggle enabled', () => {
    const logger = new Logger();
    logger.info('msg 1');
    expect(logger.getLogs().length).toBe(1);

    logger.clearLogs();
    expect(logger.getLogs().length).toBe(0);

    logger.setEnabled(false);
    logger.setLevel('debug');
  });
});
