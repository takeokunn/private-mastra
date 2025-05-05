import { Octokit } from "@octokit/rest";

import { PullRequestUrlParts, PullRequestDetails, PullRequestFileInfo } from "@src/mastra/pr-reviewer/types";

/**
 * GitHub API から PR 詳細を取得する。
 */
export const getPullRequestDetails = async (
  octokit: Octokit,
  parts: PullRequestUrlParts,
): Promise<PullRequestDetails> => {
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
 */
export const getPullRequestFiles = async (
  octokit: Octokit,
  parts: PullRequestUrlParts,
): Promise<PullRequestFileInfo[]> => {
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
 * GitHub API から PR の差分 (diff) を取得する
 */
export const getPullRequestDiff = async (octokit: Octokit, parts: PullRequestUrlParts): Promise<string> => {
  try {
    const response = await octokit.pulls.get({
      owner: parts.owner,
      repo: parts.repo,
      pull_number: parts.pull_number,
      mediaType: {
        format: "diff",
      },
    });
    return response.data as unknown as string;
  } catch (error) {
    console.error(`Error fetching PR diff for ${parts.owner}/${parts.repo}#${parts.pull_number}:`, error);
    throw new Error(`[GitHubApiError] Failed to fetch PR diff for ${parts.owner}/${parts.repo}#${parts.pull_number}`);
  }
};
