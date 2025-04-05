# PR Reviewer Agent (`prReviewerAgent`)

## 概要

`prReviewerAgent` は、指定された GitHub Pull Request (PR) の URL を受け取り、基本的なレビュー情報取得とレポート生成を行うように設計された Mastra エージェントです。
内部的に `prReviewerTool` を使用して GitHub API から PR 情報を取得し、結果を Org Mode 形式のレポートファイルとして生成します。

## 目的

*   GitHub PR のレビュープロセスを自動化および支援します。
*   開発者に対して、PR の概要、変更点、潜在的な問題点（静的解析やテスト結果に基づく）をまとめたレポートを提供します。

## 使用するツール

*   **`prReviewerTool`**:
    *   GitHub API を呼び出して PR の詳細、ファイルリスト、差分を取得します。
    *   取得した情報に基づいて Org Mode レポートを生成し、ファイルに保存します。
    *   入力: GitHub PR の URL (`prUrl`)。
    *   出力: 生成された Org Mode レポートファイルの絶対パス (`reportPath`)。
    *   詳細は `docs/mastra/tools/pr-reviewer.md` を参照してください。

## 使用例

`mastra dev` などのインターフェースを通じて、エージェントにレビューを依頼します。

```
ユーザー: Review this PR: https://github.com/some-owner/some-repo/pull/42
```

エージェントは `prReviewerTool` を実行し、成功した場合は以下のように応答します。

```
エージェント: レビューを実行しました。レポートは次の場所に生成されました: /path/to/your/project/.claude/output/YYYYMMDDHHMMSS_pull_request.org
```

ツール実行中にエラーが発生した場合は、エラーメッセージを報告します。

## 設定

*   **名前:** "Pull Request Agent"
*   **指示:** PR レビューの専門家として振る舞い、`prReviewerTool` を使用するように指示されています。
*   **モデル:** `google/gemini-1.5-pro-latest` (または設定されたモデル)
*   **ツール:** `prReviewerTool`

## 依存関係

*   `src/mastra/tools/pr-reviewer.ts`: `prReviewerTool` の実装（GitHub API 連携とレポート生成ロジックを含む）。
*   環境変数 `GITHUB_TOKEN`: `prReviewerTool` が GitHub API にアクセスするために必要です。
