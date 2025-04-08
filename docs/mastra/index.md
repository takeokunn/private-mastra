# `src/mastra/index.ts` ドキュメント

このファイルは、Mastraのメインエントリーポイントであり、`weatherAgent`のみを登録した`mastra`インスタンスを初期化・エクスポートします。

## 概要

- `Mastra`クラスと`createLogger`をインポート。
- `weatherAgent`のみをインポート。
- `weatherAgent`を登録した`mastra`インスタンスを作成。
- `mastra`をエクスポート。

## エクスポート

### `mastra`

`Mastra`クラスのインスタンス。

- **登録エージェント:**
  - `weatherAgent`
- **ロガー:** `'Mastra'`という名前で`info`レベルのロガー。

## 使用例

```typescript
import { mastra } from './path/to/mastra/index';

// 天気情報の取得
// mastra.runAgent('weatherAgent', { location: 'Tokyo' });
```

## 備考

他のエージェント（PRレビューやブログレビュー）は現状登録されていません。
