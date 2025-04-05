# `src/mastra/agents/weather.ts` のドキュメント

このファイルは、天気情報を提供するAIアシスタントである `weatherAgent` を定義します。

## 概要

`Agent` クラス、Google AIモデル、および天気情報を取得するための `weatherTool` をインポートします。

## エクスポート

### `weatherAgent`

天気アシスタントとして設定された `Agent` クラスのインスタンス。

- **名前:** 'Weather Agent'
- **指示:** エージェントに天気情報を提供するよう指示します。場所が指定されていない場合は尋ねる、英語以外の場所は翻訳する、複数部分からなる場所を処理する、関連する詳細を含める、応答を簡潔に保つ、といったガイドラインが含まれます。
- **モデル:** `google('gemini-1.5-pro-latest')` を使用します。
- **ツール:** 天気データを取得するための `weatherTool` を装備しています。

## 依存関係

- `@ai-sdk/google`: AIモデル用。
- `@mastra/core/agent`: `Agent` クラス用。
- `../tools`: `weatherTool` 用。
