import type { PullRequestUrlParts } from "@src/mastra/pr-reviewer/types";

/**
 * GitHub PR URL を解析し、owner, repo, pull number を抽出する
 */
export const parsePullRequestUrl = (url: string): PullRequestUrlParts => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) {
    throw new Error(
      "[InvalidUrl] 不正な PR URL フォーマットです。期待されるフォーマット: https://github.com/owner/repo/pull/number",
    );
  }

  return {
    owner: match[1],
    repo: match[2],
    pull_number: parseInt(match[3], 10),
  };
};
