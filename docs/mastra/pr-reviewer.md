# pr-reviewer ドメイン

GitHub プルリクエストの情報を取得し、Org Mode 形式のレビューレポートを自動生成するエージェントおよびツール群。

## 概要

- GitHub API から PR の詳細・ファイル一覧・差分を取得
- Org Mode 形式のレポートを生成し、ファイルに保存
- Mastra のツール (`prReviewerTool`) として利用可能
- `prReviewerAgent` がツールを呼び出し、レビュー支援を行う

## 主な構成

| ファイル/ディレクトリ | 役割 |
|-----------------------|-------|
| `agents/pr-reviewer.ts` | PRレビュー専用エージェント定義 |
| `tools/execute.ts`      | PR情報取得とレポート生成の実行関数 |
| `tools/index.ts`        | `prReviewerTool`ツール定義 |
| `utils/parse.ts`        | PR URLの解析ユーティリティ |
| `utils/fetcher.ts`      | GitHub API呼び出しユーティリティ |
| `utils/output.ts`       | Org Modeレポート生成・保存ユーティリティ |
| `types.ts`              | PR情報の型定義 |

## 主要ツール

### prReviewerTool

- **説明:** GitHub PR URLを入力し、レビューレポートを生成
- **入力:** `{ prUrl: string }`
- **出力:** `{ reportPath: string }`
- **内部処理:** `executePrReview()`を呼び出し、GitHub APIから情報取得→Orgレポート生成→ファイル保存

## 主要エージェント

### prReviewerAgent

- **説明:** PRレビューを担当するAIエージェント
- **モデル:** Gemini 1.5 Pro
- **ツール:** `prReviewerTool`
- **振る舞い:** ユーザーからPRレビュー依頼を受け、ツールを使ってレポート生成し、結果を報告

## 今後の拡張案

- 静的解析ツール（Biome等）との連携
- テスト実行・カバレッジ取得の自動化
- レポートの詳細化・カスタマイズ
- RAGやワークフローとの統合
