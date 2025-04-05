# `src/mastra/index.ts` のドキュメント

このファイルは、Mastraインスタンスを初期化し、エクスポートするためのメインエントリーポイントとして機能します。

## 概要

コアとなる `Mastra` クラス、`createLogger` 関数、および定義されたエージェント (`weatherAgent`, `pullRequestReviewerAgent`) をインポートします。その後、単一の `mastra` インスタンスを設定し、エクスポートします。

## エクスポート

### `mastra`

`Mastra` クラスのインスタンス。

- **エージェント:** `weatherAgent` と `pullRequestReviewerAgent` で設定されています。
- **ロガー:** `createLogger` を使用して、'Mastra' という名前で 'info' レベルのロガーを作成します。

## 使用方法

このインスタンスは、設定されたエージェントと対話するために、アプリケーションの他の場所でインポートできます。

```typescript
import { mastra } from './path/to/mastra/index';

// 例: エージェントとの対話
// mastra.runAgent('weatherAgent', { location: 'Tokyo' });
```
