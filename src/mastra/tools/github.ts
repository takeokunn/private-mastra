import { tool } from '@ai-sdk/react';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';

// Octokitを初期化
// 認証のためにGITHUB_TOKEN環境変数が設定されていることを確認
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// リポジトリ文字列からownerとrepoを解析するヘルパー関数
const parseRepoString = (repoString: string): { owner: string; repo: string } => {
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
    parameters: z.object({
      repository: z.string().describe('オーナー名とリポジトリ名 (例: "owner/repo")'),
      pullRequestNumber: z.number().describe('The number of the pull request'),
    }),
    execute: async ({ repository, pullRequestNumber }) => {
      if (!process.env.GITHUB_TOKEN) {
        console.warn('GITHUB_TOKEN環境変数が設定されていません。GitHub API呼び出しは失敗する可能性があります。');
        // オプションでエラーをスローするか、特定のメッセージを返す
        // throw new Error('GitHubトークンが設定されていません。');
      }
      try {
        const { owner, repo } = parseRepoString(repository);
        console.log(`Fetching details for PR #${pullRequestNumber} in ${owner}/${repo}`);
        const { data } = await octokit.pulls.get({
          owner,
          repo,
          pull_number: pullRequestNumber,
        });
        return {
          title: data.title,
          description: data.body || '説明はありません。', // nullの説明を処理
          author: data.user?.login || '不明な作成者', // nullの可能性があるユーザーを処理
          baseBranch: data.base.ref,
          headBranch: data.head.ref,
        };
      } catch (error) {
        console.error(`PR詳細の取得エラー ${repository}#${pullRequestNumber}:`, error);
        // 再スローするか、構造化されたエラーオブジェクトを返す
        throw new Error(`PR ${repository}#${pullRequestNumber} の詳細取得に失敗しました。 ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  }),

  /**
   * 特定のプルリクエストの差分を取得します。
   */
  getPullRequestDiff: tool({
    description: 'GitHubプルリクエストのコード変更（差分）を取得します。',
    parameters: z.object({
      repository: z.string().describe('オーナー名とリポジトリ名 (例: "owner/repo")'),
      pullRequestNumber: z.number().describe('The number of the pull request'),
    }),
    execute: async ({ repository, pullRequestNumber }) => {
       if (!process.env.GITHUB_TOKEN) {
        console.warn('GITHUB_TOKEN環境変数が設定されていません。GitHub API呼び出しは失敗する可能性があります。');
        // オプションでエラーをスローするか、特定のメッセージを返す
        // throw new Error('GitHubトークンが設定されていません。');
      }
      try {
        const { owner, repo } = parseRepoString(repository);
        console.log(`Fetching diff for PR #${pullRequestNumber} in ${owner}/${repo}`);
        const { data } = await octokit.pulls.get({
          owner,
          repo,
          pull_number: pullRequestNumber,
          mediaType: {
            format: 'diff', // diff形式をリクエスト
          },
        });
        // このメディアタイプの場合、差分コンテンツはdataフィールドに直接返されます
        return data as string;
      } catch (error) {
        console.error(`PR差分の取得エラー ${repository}#${pullRequestNumber}:`, error);
        // 再スローするか、構造化されたエラーオブジェクトを返す
        throw new Error(`PR ${repository}#${pullRequestNumber} の差分取得に失敗しました。 ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  }),
};
