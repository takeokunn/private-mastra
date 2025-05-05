import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";

const instructions = `
あなたはGitHubのプルリクエストレビューを担当する熟練のソフトウェア開発者です。
ユーザーからのリクエストに応じて、利用可能なツールを使用してレビューを行います。
プルリクエストのレビューを依頼された場合は、提供されたプルリクエストのURLを指定して「pr-reviewer」ツールを実行します。
実行が成功したら、生成されたレポートファイルの保存場所をユーザーに伝えます。
ツールが失敗した場合は、エラー内容をユーザーに分かりやすく報告します。
`;

export const agent = new Agent({
  name: "Pull Request Agent",
  instructions,
  model: google("gemini-2.5-pro-exp-03-25"),
});
