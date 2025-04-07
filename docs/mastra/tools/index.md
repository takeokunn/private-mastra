# `src/mastra/tools/index.ts` のドキュメント

このファイルは、Mastraアプリケーション内で利用可能なツールを集約し、エクスポートするためのエントリーポイントです。

## 概要

このファイルは、`./weather` から `weatherTool` をインポートし、再エクスポートします。これにより、アプリケーションの他の部分（主にエージェント）からツールに簡単にアクセスできるようになります。

## エクスポート

### `weatherTool`

`./weather` から再エクスポートされます。詳細は `docs/mastra/tools/weather.md` を参照してください。

### `prReviewerTool`

`./pr-reviewer` から再エクスポートされます。詳細は `docs/mastra/tools/pr-reviewer.md` を参照してください。

### `blogReviewerTool`

`./blog-reviewer` から再エクスポートされます。詳細は `docs/mastra/tools/blog-reviewer.md` を参照してください。

## 依存関係

- `./weather`: `weatherTool` 用。
- `./pr-reviewer`: `prReviewerTool` 用。
- `./blog-reviewer`: `blogReviewerTool` 用。
