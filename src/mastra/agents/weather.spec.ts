import { describe, it, expect, vi } from 'vitest';
import { Agent } from '@mastra/core/agent';

import { weatherAgent } from './weather';
import { weatherTool } from '../tools/weather';

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn((modelId) => ({ _isGoogleModel: true, modelId })),
}));

describe('Weather Agent (src/mastra/agents/weather.ts)', () => {
  it('should be an instance of Agent', () => {
    expect(weatherAgent).toBeInstanceOf(Agent);
    expect(weatherAgent.name).toBe('Weather Agent');
    expect(weatherAgent.instructions).toContain('You are a helpful weather assistant that provides accurate weather information.');
    expect(weatherAgent.tools.weatherTool).toBe(weatherTool);
  });

  it('should be configured with the correct model', async () => {
    const { google } = await import('@ai-sdk/google');
    expect(google).toHaveBeenCalledWith('gemini-1.5-pro-latest');
  });
});
