import { tool, ToolExecutionContext } from '@ai-sdk/react'; // Import ToolExecutionContext
import { z } from 'zod';
import { Octokit } from '@octokit/rest';
import { GetResponseDataTypeFromEndpointMethod } from "@octokit/types"; // Import type helper

// Octokitを初期化
// 認証のためにGITHUB_TOKEN環境変数が設定されていることを確認
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Define input/output schemas and types
const RepoInputSchema = z.object({
  repository: z.string().describe('オーナー名とリポジトリ名 (例: "owner/repo")'),
  pullRequestNumber: z.number().describe('プルリクエストの番号'), // Updated description
});
type RepoInput = z.infer<typeof RepoInputSchema>;

// Type for the return value of getPullRequestDetails
const PullRequestDetailsSchema = z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    baseBranch: z.string(),
    headBranch: z.string(),
});
type PullRequestDetails = z.infer<typeof PullRequestDetailsSchema>;

// Type for the return value of getPullRequestDiff (it's just a string)
const PullRequestDiffSchema = z.string();
type PullRequestDiff = z.infer<typeof PullRequestDiffSchema>;


// Type for the parsed repository string
interface ParsedRepo {
    owner: string;
    repo: string;
}

// リポジトリ文字列からownerとrepoを解析するヘルパー関数
const parseRepoString = (repoString: string): ParsedRepo => { // Use defined type
  const parts = repoString.split('/');
  if (parts.length !== 2) {
    throw new Error(`Invalid repository format: ${repoString}. Expected "owner/repo".`);
  }
  return { owner: parts[0], repo: parts[1] };
};

export const githubTools = {
  /**
   * 特定のプルリクエストの詳細を取得します。
   */
  getPullRequestDetails: tool({
    description: 'GitHubプルリクエストの詳細（タイトル、説明、作成者、ブランチなど）を取得します。',
    parameters: RepoInputSchema, // Use defined schema
    execute: async ({ repository, pullRequestNumber }: RepoInput): Promise<PullRequestDetails> => { // Add parameter and return types
      if (!process.env.GITHUB_TOKEN) {
        console.warn('GITHUB_TOKEN環境変数が設定されていません。GitHub API呼び出しは失敗する可能性があります。');
        // Consider throwing an error for clearer failure handling
        // throw new Error('GitHubトークンが設定されていません。');
        // throw new Error('GitHubトークンが設定されていません。');
      }
      try {
        const { owner, repo }: ParsedRepo = parseRepoString(repository); // Add type annotation
        console.log(`Fetching details for PR #${pullRequestNumber} in ${owner}/${repo}`);
        // Use type helper for Octokit response data
        const { data }: GetResponseDataTypeFromEndpointMethod<typeof octokit.pulls.get> = await octokit.pulls.get({
          owner,
          repo,
          pull_number: pullRequestNumber,
        });
        const details: PullRequestDetails = { // Explicitly create object matching the output type
          title: data.title,
          description: data.body || '説明はありません。', // nullの説明を処理
          author: data.user?.login || '不明な作成者', // nullの可能性があるユーザーを処理
          baseBranch: data.base.ref,
          headBranch: data.head.ref,
        };
        return details;
      } catch (error: unknown) { // Type the error as unknown
        console.error(`PR詳細の取得エラー ${repository}#${pullRequestNumber}:`, error);
        // Re-throw or return a structured error object
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`PR ${repository}#${pullRequestNumber} の詳細取得に失敗しました。 ${errorMessage}`);
      }
    },
  }),

  /**
   * 特定のプルリクエストの差分を取得します。
   */
  getPullRequestDiff: tool({
    description: 'GitHubプルリクエストのコード変更（差分）を取得します。',
    parameters: RepoInputSchema, // Use defined schema
    execute: async ({ repository, pullRequestNumber }: RepoInput): Promise<PullRequestDiff> => { // Add parameter and return types
       if (!process.env.GITHUB_TOKEN) {
        console.warn('GITHUB_TOKEN環境変数が設定されていません。GitHub API呼び出しは失敗する可能性があります。');
        // Consider throwing an error for clearer failure handling
        // throw new Error('GitHubトークンが設定されていません。');
        // throw new Error('GitHubトークンが設定されていません。');
      }
      try {
        const { owner, repo }: ParsedRepo = parseRepoString(repository); // Add type annotation
        console.log(`Fetching diff for PR #${pullRequestNumber} in ${owner}/${repo}`);
        // Although the return type is string here, using the helper is good practice
        const { data }: GetResponseDataTypeFromEndpointMethod<typeof octokit.pulls.get> = await octokit.pulls.get({
          owner,
          repo,
          pull_number: pullRequestNumber,
          mediaType: {
            format: 'diff', // diff形式をリクエスト
          },
        });
        // このメディアタイプの場合、差分コンテンツはdataフィールドに直接返されます (string)
        // Ensure the data is actually a string before returning
        if (typeof data !== 'string') {
             throw new Error(`Expected diff data to be a string, but received ${typeof data}`);
        }
        return data;
      } catch (error: unknown) { // Type the error as unknown
        console.error(`PR差分の取得エラー ${repository}#${pullRequestNumber}:`, error);
        // Re-throw or return a structured error object
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`PR ${repository}#${pullRequestNumber} の差分取得に失敗しました。 ${errorMessage}`);
      }
    },
  }),
};
