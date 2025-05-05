import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { tool as githubTool } from "../integrations/github";

const instructions = `
# 命令

Pull Requestの変更内容について、PRがどういう意図で作られたのかサマリを出力してください。

# 出力フォーマット（org）

以下の形式で出力してください。
また、人間が読みやすいように文章は適宜改行してください。

\`\`\`org
* サマリ
** PRの目的

[descriptionやdiffを見て、どういう対応なのか詳細に説明]

** 変更ファイル

[ファイル名、変更増減数(+/-)、変更内容をテーブル表記分かりやすく出力]
\`\`\`
`;

export const agent = new Agent({
  name: "Pull Request Agent",
  instructions,
  model: google("gemini-1.5-flash-latest"),
  tools: { githubTool },
});
