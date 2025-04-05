# `src/mastra/agents/pullRequestReviewer.ts` のドキュメント

このファイルは、GitHubプルリクエストのレビューに特化したAIアシスタントである `pullRequestReviewerAgent` を定義します。

## 概要

`Agent` クラス、Google AIモデル、およびその機能に必要な特定のGitHubツール (`getPullRequestDetails`, `getPullRequestDiff`) をインポートします。

## エクスポート

### `pullRequestReviewerAgent`

コードレビュアーとして設定された `Agent` クラスのインスタンス。

- **名前:** 'Pull Request Reviewer Agent'
- **指示:** PRをレビューする際にエージェントが従うべき詳細な手順:
    1. コンテキストを理解するために `getPullRequestDetails` を使用する。
    2. コードの変更を確認するために `getPullRequestDiff` を使用する。
    3. 明瞭さ、適切さ、潜在的な問題、ベストプラクティスに基づいて分析する。
    4. レビューの簡潔な要約を提供する。
    5. 必要であれば特定の行に言及するが、応答に長すぎるコードスニペットを含めない。
    6. レビューを開始するにはリポジトリ名とPR番号が必要。
- **モデル:** `google('gemini-1.5-pro-latest')` を使用します。
- **ツール:** `../tools` からの `getPullRequestDetails` と `getPullRequestDiff` を装備しています。

## 依存関係

- `@ai-sdk/google`: AIモデル用。
- `@mastra/core/agent`: `Agent` クラス用。
- `../tools`: `getPullRequestDetails` および `getPullRequestDiff` ツール用。
