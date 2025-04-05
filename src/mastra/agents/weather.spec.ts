import { describe, it, expect, vi } from 'vitest';
import { Agent } from '@mastra/core/agent';

import { weatherAgent } from './weather';
import { weatherTool } from '../tools/weather';

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn((modelId) => ({ _isGoogleModel: true, modelId })),
}));

describe('Weather Agent (src/mastra/agents/weather.ts)', () => {
  it('should be an instance of Agent with correct configuration', () => { // Combined assertions
    expect(weatherAgent).toBeInstanceOf(Agent);
    expect(weatherAgent.name).toBe('Weather Agent');
    // Check for Japanese instructions
    expect(weatherAgent.instructions).toContain('あなたは正確な天気情報を提供する、役に立つ天気アシスタントです。');
    expect(weatherAgent.instructions).toContain('場所が指定されていない場合は、必ず場所を尋ねてください。');
    expect(weatherAgent.instructions).toContain('現在の天気データを取得するには、weatherToolを使用してください。');
    expect(weatherAgent.tools.weatherTool).toBe(weatherTool);
  });

  it('should be configured with the correct model', async () => {
    const { google } = await import('@ai-sdk/google');
    expect(google).toHaveBeenCalledWith('gemini-1.5-pro-latest');
  });
});
