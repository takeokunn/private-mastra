import { Octokit } from "@octokit/rest";
import { parsePullRequestUrl } from "../utils/parse";
import { getPullRequestDetails, getPullRequestFiles, getPullRequestDiff } from "../utils/fetcher";
import type { PullRequestUrlParts, PullRequestDetails, PullRequestFileInfo } from "../types"

/**
 * PRの情報を取得する
 */
export const fetchPullRequest = async (url: string): Promise<{
  parts: PullRequestUrlParts,
  details: PullRequestDetails,
  files: PullRequestFileInfo[],
  diff: string,
}> => {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error("ツール実行失敗: 環境変数 GITHUB_TOKEN が設定されていません。");
    throw new Error("[MissingToken] 環境変数 GITHUB_TOKEN が設定されていません。");
  }

  const octokit = new Octokit({ auth: githubToken });

  try {
    const parts = parsePullRequestUrl(url);
    console.log(`Fetching details for PR: ${parts.owner}/${parts.repo}#${parts.pull_number}`);

    const details = await getPullRequestDetails(octokit, parts);
    const files = await getPullRequestFiles(octokit, parts);
    const diff = await getPullRequestDiff(octokit, parts);

    return { parts, details, files, diff };
  } catch (error) {
    console.error("ツール実行中にエラーが発生しました:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        `[ToolExecutionError] PR レビューツールの実行中に予期しないエラーが発生しました: ${String(error)}`,
      );
    }
  }
};
