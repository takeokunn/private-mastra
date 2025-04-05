import { describe, it, expect, vi } from 'vitest';
import { weatherAgent, pullRequestReviewerAgent } from './index';
import { Agent } from '@mastra/core/agent';
import { weatherTool } from '../tools'; // weatherTool の実体を確認
// pullRequestReviewerAgent のツールもインポートして確認
import { getPullRequestDetails, getPullRequestDiff } from '../tools';

// AI SDK モジュールをモック (モデルコンストラクタが呼び出されることを確認するため)
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn((modelId) => ({ modelId })), // 簡単なモック実装
}));

describe('Agents Index', () => {
  it('should export weatherAgent correctly configured', () => {
    expect(weatherAgent).toBeInstanceOf(Agent);
    expect(weatherAgent.name).toBe('Weather Agent');
    expect(weatherAgent.instructions).toContain('helpful weather assistant');
    expect(weatherAgent.model).toEqual({ modelId: 'gemini-1.5-pro-latest' }); // モックされたモデルを確認
    expect(weatherAgent.tools).toEqual({ weatherTool }); // 実際のツールインスタンスと比較
  });

  it('should re-export pullRequestReviewerAgent', () => {
    // pullRequestReviewerAgent が ./pullRequestReviewer からインポートされたものであることを確認
    // (直接的なテストは難しいが、存在と基本的な型を確認)
    expect(pullRequestReviewerAgent).toBeDefined();
    expect(pullRequestReviewerAgent).toBeInstanceOf(Agent);
    // pullRequestReviewerAgent の設定が正しいかは、専用のテストファイルで行う
    // ここでは、期待されるツールを持っているか程度は確認できる
     expect(pullRequestReviewerAgent.tools).toHaveProperty('getPullRequestDetails');
     expect(pullRequestReviewerAgent.tools).toHaveProperty('getPullRequestDiff');
     expect(pullRequestReviewerAgent.tools.getPullRequestDetails).toBe(getPullRequestDetails);
     expect(pullRequestReviewerAgent.tools.getPullRequestDiff).toBe(getPullRequestDiff);
  });
});
