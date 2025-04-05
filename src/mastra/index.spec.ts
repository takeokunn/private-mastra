import { describe, it, expect, vi } from 'vitest';
import { mastra } from './index';
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';

vi.mock('@mastra/core/logger', () => ({
  createLogger: vi.fn((config) => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    _config: config,
    getConfig: () => config,
  })),
}));

describe('Mastra Instance (src/mastra/index.ts)', () => {
  it('should be an instance of Mastra', () => {
    expect(mastra).toBeInstanceOf(Mastra);
  });

  it('should be configured with the correct agents', () => {
    expect(mastra).toBeInstanceOf(Mastra);
  });

  it('should configure the logger correctly', async () => {
    const mockedCreateLogger = vi.mocked(createLogger);
    expect(mockedCreateLogger).toHaveBeenCalledTimes(1);
    expect(mockedCreateLogger).toHaveBeenCalledWith({
      name: 'Mastra',
      level: 'info',
    });
  });
});
