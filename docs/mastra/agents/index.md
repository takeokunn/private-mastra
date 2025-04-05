# `src/mastra/agents/index.ts` のドキュメント

このファイルは、Mastraアプリケーション内で利用可能なエージェントを定義し、エクスポートします。

## 概要

`@mastra/core/agent` からの `Agent`、AIモデル (`google`)、ツール (`weatherTool`) などの必要なコンポーネントをインポートします。`weatherAgent` を直接定義し、`pullRequestReviewerAgent` を専用モジュールから再エクスポートします。

## エクスポート

### `weatherAgent`

天気アシスタントとして設定された `Agent` クラスのインスタンス。

- **名前:** 'Weather Agent'
- **指示:** エージェントに天気情報を提供するよう指示します。場所が指定されていない場合は尋ねる、英語以外の場所は翻訳する、複数部分からなる場所を処理する、関連する詳細を含める、応答を簡潔に保つ、といったガイドラインが含まれます。
- **モデル:** `google('gemini-1.5-pro-latest')` を使用します。
- **ツール:** 天気データを取得するための `weatherTool` を装備しています。

### `pullRequestReviewerAgent`

`./pullRequestReviewer` から再エクスポートされます。詳細は `docs/mastra/agents/pullRequestReviewer.md` を参照してください。

## 依存関係

- `@ai-sdk/google`: AIモデル用。
- `@mastra/core/agent`: `Agent` クラス用。
- `../tools`: `weatherTool` 用。
- `./pullRequestReviewer`: `pullRequestReviewerAgent` 用。
