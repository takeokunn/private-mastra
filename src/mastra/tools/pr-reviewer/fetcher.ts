import { Octokit } from "@octokit/rest";

import { PrUrlParts, PrDetails, PrFileInfo } from './types'

/**
 * GitHub API から PR 詳細を取得する。
 *
 * @param octokit Octokit インスタンス。
 * @param parts 解析済みの PR URL 情報。
 * @returns PR 詳細情報。
 * @throws {Error} API 呼び出しに失敗した場合。
 */
export const getPrDetails = async (octokit: Octokit, parts: PrUrlParts): Promise<PrDetails> => {
  try {
    const response = await octokit.pulls.get({
      owner: parts.owner,
      repo: parts.repo,
      pull_number: parts.pull_number,
    });
    return {
      owner: parts.owner,
      repo: parts.repo,
      pull_number: parts.pull_number,
      title: response.data.title,
      body: response.data.body,
      html_url: response.data.html_url,
      base_sha: response.data.base.sha,
      head_sha: response.data.head.sha,
    };
  } catch (error) {
    console.error(`Error fetching PR details for ${parts.owner}/${parts.repo}#${parts.pull_number}:`, error);
    throw new Error(
      `[GitHubApiError] Failed to fetch PR details for ${parts.owner}/${parts.repo}#${parts.pull_number}`,
    );
  }
};

/**
 * GitHub API から変更されたファイルリストを取得する。
 *
 * @param octokit Octokit インスタンス。
 * @param parts 解析済みの PR URL 情報。
 * @returns ファイル情報の配列。
 * @throws {Error} API 呼び出しに失敗した場合。
 */
export const getPrFiles = async (octokit: Octokit, parts: PrUrlParts): Promise<PrFileInfo[]> => {
  try {
    const response = await octokit.pulls.listFiles({
      owner: parts.owner,
      repo: parts.repo,
      pull_number: parts.pull_number,
    });
    return response.data.map((file) => ({
      filename: file.filename,
      status: file.status,
      changes: file.changes,
      additions: file.additions,
      deletions: file.deletions,
    }));
  } catch (error) {
    console.error(`Error fetching PR files for ${parts.owner}/${parts.repo}#${parts.pull_number}:`, error);
    throw new Error(`[GitHubApiError] Failed to fetch PR files for ${parts.owner}/${parts.repo}#${parts.pull_number}`);
  }
};

/**
 * GitHub API から PR の差分 (diff) を取得する。
 *
 * @param octokit Octokit インスタンス。
 * @param parts 解析済みの PR URL 情報。
 * @returns diff 文字列。
 * @throws {Error} API 呼び出しに失敗した場合。
 */
export const getPrDiff = async (octokit: Octokit, parts: PrUrlParts): Promise<string> => {
  try {
    const response = await octokit.pulls.get({
      owner: parts.owner,
      repo: parts.repo,
      pull_number: parts.pull_number,
      mediaType: {
        format: "diff",
      },
    });
    // mediaType format がレスポンス型を変更するため、型アサーションが必要
    return response.data as unknown as string;
  } catch (error) {
    console.error(`Error fetching PR diff for ${parts.owner}/${parts.repo}#${parts.pull_number}:`, error);
    throw new Error(`[GitHubApiError] Failed to fetch PR diff for ${parts.owner}/${parts.repo}#${parts.pull_number}`);
  }
};
