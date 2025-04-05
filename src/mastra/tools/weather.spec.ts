import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { weatherTool } from './weather';
import type { GeocodingResponse, WeatherResponse, Response } from './weather';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Weather Tool (src/mastra/tools/weather.ts)', () => {
  beforeEach(() => {
    vi.resetAllMocks(); // 各テスト前にモックをリセット
  });
});
