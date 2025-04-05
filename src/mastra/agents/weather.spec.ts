import { describe, it, expect, vi } from 'vitest';
import { weatherAgent } from './weather'; // テスト対象のエージェント
import { Agent } from '@mastra/core/agent'; // Agentクラスの型
import { weatherTool } from '../tools/weather'; // 設定されているツール

// AI SDK モジュールをモック (モデルコンストラクタが呼び出されることを確認するため)
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn((modelId) => ({ // 簡単なモック実装: モデルIDを持つオブジェクトを返す
    _isGoogleModel: true, // モックであることを示すフラグ（オプション）
    modelId,
  })),
}));

describe('Weather Agent (src/mastra/agents/weather.ts)', () => {
  it('should be an instance of Agent', () => {
    expect(weatherAgent).toBeInstanceOf(Agent);
  });

  it('should have the correct name', () => {
    expect(weatherAgent.name).toBe('Weather Agent');
  });

  it('should have the correct instructions', () => {
    // 指示内容の主要な部分が含まれているかを確認
    expect(weatherAgent.instructions).toContain('helpful weather assistant');
    expect(weatherAgent.instructions).toContain('Always ask for a location');
    expect(weatherAgent.instructions).toContain('Use the weatherTool');
  });

  it('should be configured with the correct model', () => {
    // モックされた google 関数が正しい引数で呼び出されたか確認
    const { google } = await import('@ai-sdk/google');
    expect(google).toHaveBeenCalledWith('gemini-1.5-pro-latest');

    // Agentインスタンスが持つモデルオブジェクトを確認 (モックの実装に依存)
    expect(weatherAgent.model).toBeDefined();
    expect(weatherAgent.model).toHaveProperty('modelId', 'gemini-1.5-pro-latest');
  });

  it('should be configured with the correct tools', () => {
    expect(weatherAgent.tools).toBeDefined();
    expect(weatherAgent.tools).toHaveProperty('weatherTool');
    // インポートした実際のツールインスタンスと比較
    expect(weatherAgent.tools.weatherTool).toBe(weatherTool);
  });
});
