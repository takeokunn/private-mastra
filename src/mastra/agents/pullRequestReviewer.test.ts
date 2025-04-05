import { describe, it, expect, vi } from 'vitest';
import { pullRequestReviewerAgent } from './pullRequestReviewer';
import { Agent } from '@mastra/core/agent';
import { getPullRequestDetails, getPullRequestDiff } from '../tools'; // ツールをインポート

// AI SDK モジュールをモック
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn((modelId) => ({ modelId })),
}));

describe('Pull Request Reviewer Agent', () => {
  it('should be correctly configured', () => {
    expect(pullRequestReviewerAgent).toBeInstanceOf(Agent);
    expect(pullRequestReviewerAgent.name).toBe('Pull Request Reviewer Agent');
    expect(pullRequestReviewerAgent.instructions).toContain('expert code reviewer AI assistant');
    expect(pullRequestReviewerAgent.instructions).toContain("Use the 'getPullRequestDetails' tool");
    expect(pullRequestReviewerAgent.instructions).toContain("Use the 'getPullRequestDiff' tool");
    expect(pullRequestReviewerAgent.model).toEqual({ modelId: 'gemini-1.5-pro-latest' });
    expect(pullRequestReviewerAgent.tools).toEqual({ getPullRequestDetails, getPullRequestDiff });
  });
});
