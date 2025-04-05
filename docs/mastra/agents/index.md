# `src/mastra/agents/index.ts` のドキュメント

このファイルは、Mastraアプリケーション内で利用可能なエージェントを定義し、エクスポートします。

## 概要

このファイルは、`./weather` から `weatherAgent` をインポートし、再エクスポートします。これにより、アプリケーションの他の部分からエージェントに簡単にアクセスできるようになります。

## エクスポート

### `weatherAgent`

`./weather` から再エクスポートされます。詳細は `docs/mastra/agents/weather.md` を参照してください。

## 依存関係

- `./weather`: `weatherAgent` 用。
