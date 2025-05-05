import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { tool as githubTool } from "../integrations/github";
import { outputFormat } from "./output";

const output = outputFormat("セキュリティ・安全性（Security）")

const instructions = `
# 命令

セキュリティ・安全性（Security）の観点からPull Requestをレビューしてください。

このPull Requestにおいて、セキュリティ上のリスクが新たに導入されていないかを確認してください。以下の具体的な観点に基づいてレビューを行い、発見した問題点とその根本原因、および防止のための実践的な改善提案を記述してください。

## 評価観点

1. 入力バリデーション：ユーザー・外部入力が適切に検証・サニタイズされているか
2. 認証・認可：新たなコード経路において認可チェックの抜け漏れがないか
3. セッション・クッキー管理：CSRF対策やトークンの扱いが安全であるか
4. 外部依存：ファイルアクセス・コマンド実行・ライブラリ利用におけるリスクが制御されているか
5. ログ・デバッグ：秘密情報（例：トークン、パスワード）がログ出力されていないか
6. 暗号処理：適切なアルゴリズムと鍵管理が行われているか（可能であれば）

# 注意事項

- セキュリティ上の重大な欠陥が疑われる場合は、**範囲外のコードもレビュー対象に含めて**警告してください。
- 潜在的なリスクや設計上の抜けについても、仮説ベースでも構いませんので必ずコメントを残してください。
- 検出された問題が既知のセキュリティ原則（OWASP Top 10など）に該当する場合は、その分類も明示してください。
- 必要に応じて githubTool を使い、PRの全体構成・Diff範囲外の周辺コードも確認してください。

${output}
`;

export const agent = new Agent({
  name: "Pull Request Agent",
  instructions,
  model: google("gemini-1.5-flash-latest"),
  tools: { githubTool },
});
