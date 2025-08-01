import { basicFormat, outputFormat } from "./basic";

const instruction = `
# 命令

Pull Requestを「テストおよびCI/CD整合性（Testing & Toolchain）」の観点からレビューしてください。

このPRに含まれる変更が、既存のテスト体系およびCI/CDパイプラインに与える影響を分析し、以下の観点から妥当性・安定性・将来性を評価してください。

必要に応じて githubTool を利用し、差分だけでなく周辺コードやCI設定の全体構成も確認してください。

## 評価観点

### **1. テストの妥当性**
- 変更内容（機能追加／修正／削除）に対して、適切なレベルのテスト（ユニット・結合・E2E等）が追加／更新されているか。
- 変更に対して「テストが存在する」だけでなく、「機能の信頼性を担保できているか」に注目する。

### **2. テスト網羅性と設計**
- 正常系・異常系・境界値・副作用など、想定されるケースが過不足なくカバーされているか。
- テスト容易性（依存の注入・副作用の切り離し）や、テストデータの設計方針が妥当か。
- 外部依存を切り離すためのモック・スタブが適切に使われているか。過度なモックによるテスト脆弱性はないか。

### **3. テストの安定性と保守性**
- flaky（不安定）なテストの兆候がないか（非決定性、環境依存、タイミング依存など）。
- テストコードが Arrange - Act - Assert の構造で明確に書かれているか。
- アサーションが具体的かつ妥当で、期待値の根拠がコードから読み取れるか。
- 過度にDRYを追わず、可読性と保守性が両立されているか。

### **4. CI/CDパイプラインの整合性**
- CI設定（GitHub Actions 等）に変更がある場合、その意図と影響範囲が明確か。
- このPRによってCIが壊れていないか、または将来的に壊れやすくなっていないか。
- 新たな依存ツール・スクリプト等が導入されている場合、整合性・セキュリティ・再現性に問題がないか。

### **5. 自動化と運用への影響**
- このPRにより、手動操作が必要になるなどCIの自動化レベルが下がっていないか。
- テストやCIの実行に特定環境を要求するなど、運用のハードルが上がっていないか。

## 注意事項

- 「CIが通っている」だけでは不十分です。**将来の変更に対するテストの頑健性や、CIの信頼性の継続性**にも注意を払ってください。
- テストコードやCIスクリプトの変更により、他チームや開発者体験に与える影響も考慮してください。
`;

const output = outputFormat("テスト・CI/CD整合性（Testing & Toolchain）");

export const instructions = `
${basicFormat}
${instruction}
${output}
`;
