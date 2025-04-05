import { describe, it, expect, vi } from 'vitest';
import { mastra } from './index'; // テスト対象のインスタンス
import { Mastra } from '@mastra/core/mastra'; // Mastraクラスの型
import { createLogger } from '@mastra/core/logger'; // モック対象
import { weatherAgent, pullRequestReviewerAgent } from './agents'; // 設定されたエージェント

// Logger モジュールをモック
vi.mock('@mastra/core/logger', () => ({
  createLogger: vi.fn((config) => ({ // モックロガーを返すファクトリ関数
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    // テストで設定を確認できるようにconfigを保持
    _config: config, // プライベートなプロパティとして保持（またはgetter）
    getConfig: () => config, // 設定を取得するメソッド
  })),
}));

describe('Mastra Instance (src/mastra/index.ts)', () => {
  it('should be an instance of Mastra', () => {
    expect(mastra).toBeInstanceOf(Mastra);
  });

  it('should be configured with the correct agents', () => {
    // Mastraインスタンスが内部で持つエージェント設定を確認
    // Mastraクラスの実装に依存するが、通常はコンストラクタで渡された設定が
    // 内部プロパティやgetter経由でアクセス可能と仮定する
    // もし直接アクセスできない場合は、Mastraのコンストラクタが呼び出された際の引数を検証する
    // (ただし、インスタンスは既に生成されているため、ここでは難しい)

    // ここでは、Mastraインスタンスが持つであろう `config` または `agents` プロパティを期待
    // Mastraクラスの実際のAPIに合わせて調整が必要
    // 例: mastra.config.agents や mastra.getAgents() など

    // 仮に `config` プロパティが存在すると仮定
    // @ts-expect-error - configがプライベートまたは存在しない可能性があるためエラーを抑制
    const configuredAgents = mastra.config?.agents;

    expect(configuredAgents).toBeDefined();
    expect(configuredAgents).toHaveProperty('weatherAgent');
    expect(configuredAgents?.weatherAgent).toBe(weatherAgent); // インポートされたインスタンスと比較
    expect(configuredAgents).toHaveProperty('pullRequestReviewerAgent');
    expect(configuredAgents?.pullRequestReviewerAgent).toBe(pullRequestReviewerAgent); // インポートされたインスタンスと比較
  });

  it('should be configured with the correct logger settings', async () => {
    // モックされた createLogger が期待通りに呼び出されたか確認
    // モック関数は即時実行されるため、インポート後に直接確認できる
    const mockedCreateLogger = vi.mocked(createLogger);
    expect(mockedCreateLogger).toHaveBeenCalledTimes(1); // Mastraインスタンス生成時に1回呼び出されるはず
    expect(mockedCreateLogger).toHaveBeenCalledWith({
      name: 'Mastra',
      level: 'info',
    });

    // Mastraインスタンスがモックロガーを持っていることを確認
    // @ts-expect-error - loggerがプライベートまたは存在しない可能性があるためエラーを抑制
    const configuredLogger = mastra.logger;
    expect(configuredLogger).toBeDefined();

    // モックロガーが保持する設定を確認 (モックの実装に依存)
    const loggerConfig = configuredLogger?.getConfig ? configuredLogger.getConfig() : configuredLogger?._config;

    expect(loggerConfig).toEqual({
       name: 'Mastra',
       level: 'info',
    });
  });
});
