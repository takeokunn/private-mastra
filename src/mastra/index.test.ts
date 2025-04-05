import { describe, it, expect, vi } from 'vitest';
import { mastra } from './index';
import { Mastra } from '@mastra/core/mastra';
import { weatherAgent, pullRequestReviewerAgent } from './agents'; // エージェントをインポート

// Logger モジュールをモック
vi.mock('@mastra/core/logger', () => ({
  createLogger: vi.fn((config) => ({ // モックロガーを返す
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    config, // 設定を保持して確認できるようにする
  })),
}));

describe('Mastra Instance', () => {
  it('should be an instance of Mastra', () => {
    expect(mastra).toBeInstanceOf(Mastra);
  });

  it('should be configured with the correct agents', () => {
    // Mastraクラスの内部実装に依存せず、設定が渡されたことを確認
    // (Mastraクラスが設定をプロパティとして公開していると仮定)
    // もし公開されていない場合は、Mastraのコンストラクタが呼び出された際の引数を確認する
    // ここでは、エクスポートされたエージェントが設定に含まれていることを確認
    expect(mastra.config.agents).toBeDefined();
    expect(mastra.config.agents).toHaveProperty('weatherAgent');
    expect(mastra.config.agents.weatherAgent).toBe(weatherAgent); // インポートされたインスタンスと比較
    expect(mastra.config.agents).toHaveProperty('pullRequestReviewerAgent');
    expect(mastra.config.agents.pullRequestReviewerAgent).toBe(pullRequestReviewerAgent); // インポートされたインスタンスと比較
  });

  it('should be configured with the correct logger settings', () => {
    // モックされた createLogger が期待通りに呼び出されたか確認
    const { createLogger } = await import('@mastra/core/logger');
    expect(createLogger).toHaveBeenCalledWith({
      name: 'Mastra',
      level: 'info',
    });
    // Mastraインスタンスがモックロガーを持っていることを確認 (内部実装に依存)
    expect(mastra.logger).toBeDefined();
    expect(mastra.logger.config).toEqual({ // モックロガーが保持する設定を確認
       name: 'Mastra',
       level: 'info',
    });
  });
});
