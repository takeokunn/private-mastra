# weather ドメイン

指定した地名の天気情報を取得し、エージェントが回答できるようにするツール群。

## 概要

- Open-Meteo APIを利用して現在の天気を取得
- 緯度経度のジオコーディングも対応
- Mastraのツール (`weatherTool`) として利用可能
- `weatherAgent` がツールを呼び出し、天気情報を提供

## 主な構成

| ファイル/ディレクトリ | 役割 |
|-----------------------|-------|
| `agents/weather.ts`   | 天気情報取得用エージェント定義 |
| `tools/weather.ts`    | 天気取得ツールの実装 |
| `tools/index.ts`      | `weatherTool`ツール定義 |
| `utils/fetcher.ts`    | API呼び出しユーティリティ |
| `types.ts`            | APIレスポンス型定義 |

## 主要ツール

### weatherTool

- **説明:** 地名を入力し、現在の天気情報を取得
- **入力:** `{ location: string }`
- **出力:** `{ temperature, feelsLike, humidity, windSpeed, windGust, conditions, location }`
- **内部処理:** ジオコーディング→天気API呼び出し→整形して返却

## 主要エージェント

### weatherAgent

- **説明:** 天気情報を提供するAIエージェント
- **モデル:** Gemini 1.5 Pro
- **ツール:** `weatherTool`
- **振る舞い:** ユーザーからの天気問い合わせに応じてツールを使い、回答

## 今後の拡張案

- 予報や過去天気の取得対応
- 複数地点の同時取得
- RAGやワークフローとの連携
- 天気に基づく提案や通知機能
