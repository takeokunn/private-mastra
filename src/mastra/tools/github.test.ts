import { describe, it, expect, vi, beforeEach } from 'vitest';
import { githubTools } from './github';
import { Octokit } from '@octokit/rest';
import { z } from 'zod';

// @octokit/rest をモック
vi.mock('@octokit/rest', () => {
  const mockPullsGet = vi.fn();
  const mockOctokitInstance = {
    pulls: {
      get: mockPullsGet,
    },
  };
  return {
    Octokit: vi.fn(() => mockOctokitInstance), // Octokit コンストラクタをモック
    mockPullsGet, // テスト内でモック実装を設定するためにエクスポート
  };
});

// モックされた Octokit のメソッドを取得 (型アサーションが必要な場合がある)
const { mockPullsGet } = vi.mocked(await import('@octokit/rest'), true);


// parseRepoString をテスト可能にするためにエクスポートするか、ここでテスト
// ここでは githubTools を通して間接的にテストします
const parseRepoString = (repoString: string): { owner: string; repo: string } => {
  const parts = repoString.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) { // Check for empty parts
    throw new Error(`Invalid repository format: ${repoString}. Expected "owner/repo".`);
  }
  return { owner: parts[0], repo: parts[1] };
};


describe('GitHub Tools', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetAllMocks(); // モックをリセット
    vi.resetModules(); // モジュールのキャッシュをリセット (環境変数の変更を反映させるため)
    process.env = { ...OLD_ENV }; // 環境変数をリセット
    process.env.GITHUB_TOKEN = 'test-token'; // デフォルトでトークンを設定
  });

   afterAll(() => {
    process.env = OLD_ENV; // テスト後に環境変数を元に戻す
  });

  describe('parseRepoString', () => {
     it('should parse valid repo string', () => {
        expect(parseRepoString('owner/repo')).toEqual({ owner: 'owner', repo: 'repo' });
     });

     it('should throw error for invalid format', () => {
        expect(() => parseRepoString('owner-repo')).toThrow('Invalid repository format');
        expect(() => parseRepoString('owner/repo/extra')).toThrow('Invalid repository format');
        expect(() => parseRepoString('/repo')).toThrow('Invalid repository format');
        expect(() => parseRepoString('owner/')).toThrow('Invalid repository format');
        expect(() => parseRepoString('')).toThrow('Invalid repository format');
     });
  });


  describe('getPullRequestDetails', () => {
    const tool = githubTools.getPullRequestDetails;
    const input = { repository: 'test-owner/test-repo', pullRequestNumber: 123 };

    it('should have correct schema and description', () => {
      expect(tool.description).toBe('GitHubプルリクエストの詳細（タイトル、説明、作成者、ブランチなど）を取得します。');
      expect(tool.parameters).toBeInstanceOf(z.ZodObject);
      // Add more specific schema checks if needed
    });

    it('should execute successfully and return details', async () => {
      const mockApiResponse = {
        data: {
          title: 'Test PR Title',
          body: 'Test PR Description',
          user: { login: 'test-author' },
          base: { ref: 'main' },
          head: { ref: 'feature-branch' },
          // 他の不要なプロパティ...
        },
      };
      mockPullsGet.mockResolvedValue(mockApiResponse);

      const result = await tool.execute(input);

      expect(mockPullsGet).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        pull_number: 123,
      });
      expect(result).toEqual({
        title: 'Test PR Title',
        description: 'Test PR Description',
        author: 'test-author',
        baseBranch: 'main',
        headBranch: 'feature-branch',
      });
    });

     it('should handle null description and user', async () => {
      const mockApiResponse = {
        data: {
          title: 'Test PR Title',
          body: null, // Null description
          user: null, // Null user
          base: { ref: 'main' },
          head: { ref: 'feature-branch' },
        },
      };
      mockPullsGet.mockResolvedValue(mockApiResponse);

      const result = await tool.execute(input);

      expect(result.description).toBe('説明はありません。');
      expect(result.author).toBe('不明な作成者');
    });


    it('should throw error if Octokit call fails', async () => {
      const apiError = new Error('GitHub API Error');
      mockPullsGet.mockRejectedValue(apiError);

      await expect(tool.execute(input))
        .rejects
        .toThrow(`PR ${input.repository}#${input.pullRequestNumber} の詳細取得に失敗しました。 ${apiError.message}`);
    });

     it('should warn if GITHUB_TOKEN is missing but still attempt call', async () => {
      delete process.env.GITHUB_TOKEN; // トークンを削除
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      const mockApiResponse = { data: { /* ... minimal data ... */ title: 't', body: '', user: {login: 'a'}, base: {ref: 'b'}, head: {ref: 'c'} } };
      mockPullsGet.mockResolvedValue(mockApiResponse); // API呼び出しは成功すると仮定

      await tool.execute(input);

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('GITHUB_TOKEN環境変数が設定されていません'));
      expect(mockPullsGet).toHaveBeenCalled(); // API呼び出しは試行される

      consoleWarnSpy.mockRestore();
    });

     it('should throw error for invalid repository string', async () => {
        const invalidInput = { repository: 'invalid-repo-format', pullRequestNumber: 456 };
         await expect(tool.execute(invalidInput))
            .rejects
            .toThrow(`PR ${invalidInput.repository}#${invalidInput.pullRequestNumber} の詳細取得に失敗しました。 Invalid repository format: ${invalidInput.repository}`);
         expect(mockPullsGet).not.toHaveBeenCalled();
     });
  });

  describe('getPullRequestDiff', () => {
    const tool = githubTools.getPullRequestDiff;
    const input = { repository: 'test-owner/test-repo', pullRequestNumber: 456 };

    it('should have correct schema and description', () => {
      expect(tool.description).toBe('GitHubプルリクエストのコード変更（差分）を取得します。');
      expect(tool.parameters).toBeInstanceOf(z.ZodObject);
    });

    it('should execute successfully and return diff string', async () => {
      const mockDiff = 'diff --git a/file.txt b/file.txt\n--- a/file.txt\n+++ b/file.txt\n@@ -1 +1 @@\n-old content\n+new content';
      const mockApiResponse = {
        // diff フォーマットの場合、データは文字列として返される
        data: mockDiff,
      };
      mockPullsGet.mockResolvedValue(mockApiResponse);

      const result = await tool.execute(input);

      expect(mockPullsGet).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        pull_number: 456,
        mediaType: { format: 'diff' },
      });
      expect(result).toBe(mockDiff);
    });

    it('should throw error if Octokit call fails', async () => {
      const apiError = new Error('GitHub Diff API Error');
      mockPullsGet.mockRejectedValue(apiError);

      await expect(tool.execute(input))
        .rejects
        .toThrow(`PR ${input.repository}#${input.pullRequestNumber} の差分取得に失敗しました。 ${apiError.message}`);
    });

     it('should throw error if returned data is not a string', async () => {
        const mockApiResponse = { data: { not: 'a string' } }; // Invalid data type
        mockPullsGet.mockResolvedValue(mockApiResponse);

        await expect(tool.execute(input))
            .rejects
            .toThrow('Expected diff data to be a string, but received object');
     });

     it('should warn if GITHUB_TOKEN is missing but still attempt call', async () => {
      delete process.env.GITHUB_TOKEN;
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      const mockApiResponse = { data: 'diff data' };
      mockPullsGet.mockResolvedValue(mockApiResponse);

      await tool.execute(input);

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('GITHUB_TOKEN環境変数が設定されていません'));
      expect(mockPullsGet).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

     it('should throw error for invalid repository string', async () => {
        const invalidInput = { repository: 'invalid/repo/format', pullRequestNumber: 789 };
         await expect(tool.execute(invalidInput))
            .rejects
            .toThrow(`PR ${invalidInput.repository}#${invalidInput.pullRequestNumber} の差分取得に失敗しました。 Invalid repository format: ${invalidInput.repository}`);
         expect(mockPullsGet).not.toHaveBeenCalled();
     });
  });
});
