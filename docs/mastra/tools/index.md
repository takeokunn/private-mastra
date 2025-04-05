# `src/mastra/tools/index.ts` のドキュメント

このファイルは、エージェントが利用できる様々なツールを定義し、エクスポートします。主に天気情報に焦点を当て、GitHubツールを再エクスポートします。

## 概要

`@mastra/core/tools` を使用して、定義されたスキーマ (`zod`) と実行ロジックを持つツールを作成します。外部API (Open-Meteo) からデータを取得し処理する関数が含まれています。

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
    temperature: z.number(), // 温度
    feelsLike: z.number(), // 体感温度
    humidity: z.number(), // 湿度
    windSpeed: z.number(), // 風速
    windGust: z.number(), // 突風
    conditions: z.string(), // 天気状況
    location: z.string(), // 解決された場所の名前
  })
  ```
- **実行:** 提供された場所で内部の `getWeather` 関数を呼び出します。

### `getPullRequestDetails`

`./github` から再エクスポートされます。詳細は `docs/mastra/tools/github.md` を参照してください。

### `getPullRequestDiff`

`./github` から再エクスポートされます。詳細は `docs/mastra/tools/github.md` を参照してください。

## 内部関数

### `getWeather(location: string)`

指定された場所のジオコーディングデータを非同期で取得し、その座標を使用してOpen-Meteo APIから天気データを取得します。場所が見つからない場合はエラーをスローします。`outputSchema` に一致する構造化された天気データを返します。

### `getWeatherCondition(code: number)`

Open-Meteoの天気コードを人間が読める形式の状況文字列（例: '晴天', '並の雨'）にマッピングします。マッピングされていないコードに対しては '不明' を返します。

## 依存関係

- `@mastra/core/tools`: `createTool` 用。
- `zod`: スキーマ定義と検証用。
- `./github`: GitHub関連ツール用。
- `fetch`: API呼び出しを行うための暗黙的な依存関係。
