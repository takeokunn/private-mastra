import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";

const instructions = `
# 命令: コード品質・可読性（Style & Clean Code）の観点からPull Requestをレビューしてください。

以下はあるPull Requestの変更内容です。この変更に対して、「コード品質・可読性」に関してレビューを行ってください。
レビューは以下の観点で構成してください：

1. 命名規則：変数・関数・クラス名がわかりやすく、文脈に合っているか。
2. 可読性：ネスト・分岐・コメント・空行などが読みやすく整理されているか。
3. 冗長性・簡潔さ：重複コードがないか、表現が簡潔かつ明確か。
4. 一貫性：コードスタイルがプロジェクト全体と一貫しているか。
5. Clean Code原則の遵守：関数の粒度、責務、命名・コメント方針などに問題がないか。

# 出力形式

org形式で出力してください。

h2にあたる部分に 「コード品質・可読性（Style & Clean Code）」を見出しにしてください。
可能な限り詳細に内容を出力してください。

# 注意事項

- 機械的なLint指摘だけでなく、文脈に応じた読みやすさも考慮してください
- プロジェクトのコーディングスタイルに明示的に反していなければ、柔軟に判断してください
- 重大性の高い順にレビュー項目を並べてください
`;

export const agent = new Agent({
  name: "Pull Request Agent",
  instructions,
  model: google("gemini-2.5-pro-exp-03-25"),
});
