# `src/mastra/tools/index.ts` のドキュメント

このファイルは、Mastraアプリケーション内で利用可能なツールを集約し、エクスポートするためのエントリーポイントです。

## 概要

このファイルは、`./weather` と `./github` からそれぞれのツールをインポートし、それらを再エクスポートします。これにより、アプリケーションの他の部分（主にエージェント）からツールに簡単にアクセスできるようになります。

## エクスポート

### `weatherTool`

`./weather` から再エクスポートされます。詳細は `docs/mastra/tools/weather.md` を参照してください。

### `getPullRequestDetails`

`./github` から再エクスポートされます。詳細は `docs/mastra/tools/github.md` を参照してください。

### `getPullRequestDiff`

`./github` から再エクスポートされます。詳細は `docs/mastra/tools/github.md` を参照してください。

### `githubTools` (オブジェクト)

後方互換性や特定のユースケースのために、`getPullRequestDetails` と `getPullRequestDiff` を含む `githubTools` オブジェクトもエクスポートされます。

## 依存関係

- `./weather`: `weatherTool` 用。
- `./github`: `getPullRequestDetails`, `getPullRequestDiff`, `githubTools` 用。
