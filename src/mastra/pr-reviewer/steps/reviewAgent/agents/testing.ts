import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { tool as githubTool } from "../integrations/github";
import { outputFormat } from "./output";

const output = outputFormat("テスト・CI/CD整合性（Testing & Toolchain）")

const instructions = `
# 命令

テスト・CI/CD整合性（Testing & Toolchain）の観点からPull Requestをレビューしてください。

このPull Requestに含まれる変更が、テストおよびCI/CDパイプラインに与える影響を確認し、以下の観点からレビューを行ってください。

必要に応じて githubTool を利用してください。

## 評価観点：

1. **テストの妥当性**
   - 新たに追加された機能や変更に対応したテストが追加・更新されているか

2. **テスト網羅性**
   - 代表値・異常系・境界値・副作用等が網羅されているか（過不足なく）

3. **CI/CD整合性**
   - CI設定ファイルの変更が妥当か。ワークフロー上の影響がないか

4. **自動化状態**
   - このPRにより手動操作が必要になったり、CIが壊れていないか

5. **テスト構成**
   - 不適切なモック／スタブ、不安定テストの兆候、実環境との不整合がないか

## 注意事項

- テストが「形式的に存在する」だけでなく、**機能の信頼性を担保しているか**に注目してください。
- 「CIが壊れていないか」だけでなく、「CIが壊れやすくなっていないか（脆弱化）」にも注意を払ってください。
- 必要に応じて githubTool を使い、PRの全体構成・Diff範囲外の周辺コードも確認してください。

${output}
`;

export const agent = new Agent({
  name: "Pull Request Agent",
  instructions,
  model: google("gemini-1.5-flash-latest"),
  tools: { githubTool },
});
