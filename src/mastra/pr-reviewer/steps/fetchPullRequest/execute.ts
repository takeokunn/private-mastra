import { Octokit } from "@octokit/rest";
import { parsePullRequestUrl } from "./utils/parse";
import { getPullRequestDetails, getPullRequestFiles, getPullRequestDiff } from "./utils/fetcher";
import type { PullRequest } from "@src/mastra/pr-reviewer/types";
import { WorkflowContext } from "@mastra/core";

/**
 * PRの情報を取得する
 */
export const execute = async (context: WorkflowContext): Promise<PullRequest> => {
  const url = context.triggerData?.inputSchema.url;

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new Error("[MissingToken] 環境変数 GITHUB_TOKEN が設定されていません。");
  }

  const octokit = new Octokit({ auth: githubToken });

  try {
    const parts = parsePullRequestUrl(url);

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
