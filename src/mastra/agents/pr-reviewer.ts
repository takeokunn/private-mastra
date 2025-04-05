import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";

import { prReviewerTool } from "../tools/pr-reviewer";

/**
 * An agent specialized in reviewing GitHub Pull Requests.
 * It uses the `prReviewerTool` to execute a review script and report the results.
 */
export const prReviewerAgent = new Agent({
  name: "Pull Request Agent",
  instructions: `
あなたはGitHubのプルリクエストレビューを担当する熟練のソフトウェア開発者です。
ユーザーからのリクエストに応じて、利用可能なツールを使用してレビューを行います。
プルリクエストのレビューを依頼された場合は、提供されたプルリクエストのURLを指定して「pr-reviewer」ツールを実行します。
実行が成功したら、生成されたレポートファイルの保存場所をユーザーに伝えます。
ツールが失敗した場合は、エラー内容をユーザーに分かりやすく報告します。
`,
  model: google("gemini-1.5-pro-latest"),
  tools: { prReviewerTool }, // Tool instance remains the same, ID is internal to the tool definition
});
