# `src/mastra/tools/weather.ts` のドキュメント

このファイルは、Open-Meteo APIを使用して天気情報を取得するためのツール `weatherTool` を定義します。

## 概要

`@mastra/core/tools` の `createTool` を使用して、定義されたスキーマ (`zod`) と実行ロジックを持つツールを作成します。ジオコーディングAPIと天気予報APIへの `fetch` 呼び出しが含まれます。

## エクスポート

### `weatherTool`

現在の天気情報を取得するために `createTool` を使用して作成されたツール。

- **ID:** `get-weather`
- **説明:** '指定された場所の現在の天気を取得します'
- **入力スキーマ:** `location` (文字列、都市名) が必要です。
  ```typescript
  z.object({
    location: z.string().describe('都市名'),
  })
  ```
- **出力スキーマ:** 天気の詳細を含むオブジェクトを返します。
  ```typescript
  z.object({
    temperature: z.number().describe('温度'),
    feelsLike: z.number().describe('体感温度'),
    humidity: z.number().describe('湿度'),
    windSpeed: z.number().describe('風速'),
    windGust: z.number().describe('突風'),
    conditions: z.string().describe('天気状況'),
    location: z.string().describe('解決された場所の名前'),
  })
  ```
- **実行:** 提供された場所で内部の `getWeather` 関数を呼び出します。

## 内部関数

### `getWeather(location: string)`

指定された場所のジオコーディングデータを非同期で取得し、その座標を使用してOpen-Meteo APIから天気データを取得します。場所が見つからない場合やAPIリクエストが失敗した場合はエラーをスローします。`outputSchema` に一致する構造化された天気データを返します。（この関数はエクスポートされていません）

## エクスポートされるヘルパー関数

### `getWeatherCondition(code: number)`

Open-Meteoの天気コードを人間が読める形式の状況文字列（例: '晴天', '並の雨'）にマッピングします。マッピングされていないコードに対しては '不明' を返します。（テスト目的でエクスポートされています）

## 依存関係

- `@mastra/core/tools`: `createTool`, `ToolExecutionContext` 用。
- `zod`: スキーマ定義と検証用。
- `ts-pattern`: `getWeatherCondition` でのパターンマッチング用。
- `fetch`: API呼び出しを行うための暗黙的な依存関係。
