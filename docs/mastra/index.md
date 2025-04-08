# Mastra ドキュメント

このドキュメントは、Mastra プロジェクトの**公開 API**と**設計方針**をまとめたものです。  
詳細なコーディング規約は [docs/rules.md](../rules.md) を参照してください。

---

## 目次

- [概要](#概要)
- [エージェント](#エージェント)
- [ツール](#ツール)
- [拡張方法](#拡張方法)
- [依存関係](#依存関係)

---

## 概要

Mastraは、**複数のAIエージェント**と**ツール**を組み合わせて、  
天気情報取得、GitHub PRレビュー、ブログ記事レビューなどを自動化・支援するプラットフォームです。

- **言語:** TypeScript
- **主要技術:** LangChain, OpenAI, Google Gemini, Octokit, Open-Meteo API
- **構成:**  
  - `src/mastra/index.ts` : Mastraインスタンスのエントリポイント  
  - `src/mastra/agents/` : 各種AIエージェント  
  - `src/mastra/tools/` : 外部API連携や処理ツール群

---

## エージェント

### `weatherAgent`

- **役割:** 指定した都市の天気情報を提供
- **モデル:** Google Gemini
- **ツール:** `weatherTool`
- **詳細:** `src/mastra/agents/weather.ts`

---

### `prReviewerAgent`

- **役割:** GitHub Pull Requestのレビューとレポート生成
- **モデル:** Google Gemini
- **ツール:** `prReviewerTool`
- **詳細:** `src/mastra/agents/pr-reviewer.ts`

---

### `blogReviewerAgent`

- **役割:** ブログ記事のレビューと改善提案
- **モデル:** OpenAI GPT or Gemini
- **ツール:** `blogReviewerTool`
- **詳細:** `src/mastra/agents/blog-reviewer.ts`

---

## ツール

| ツール名             | 説明                                         | 実装ファイル                                   |
|----------------------|----------------------------------------------|----------------------------------------------|
| `weatherTool`        | Open-Meteo APIを使い天気情報を取得           | `src/mastra/tools/weather.ts`               |
| `prReviewerTool`     | GitHub APIからPR情報を取得しレポート生成     | `src/mastra/tools/pr-reviewer.ts`           |
| `blogReviewerTool`   | ブログ記事の内容を解析し改善提案を生成       | `src/mastra/tools/blog-reviewer/index.ts`   |

---

## 拡張方法

- **新しいエージェントの追加:**
  - `src/mastra/agents/`にエージェントを実装
  - `src/mastra/agents/index.ts`でエクスポート
  - `src/mastra/index.ts`の`Mastra`インスタンスに登録

- **新しいツールの追加:**
  - `src/mastra/tools/`にツールを実装
  - `src/mastra/tools/index.ts`でエクスポート
  - 必要なエージェントに組み込む

---

## 依存関係

- **AIモデル:**  
  - OpenAI GPT  
  - Google Gemini

- **APIクライアント:**  
  - Octokit (GitHub API)  
  - Open-Meteo API

- **フレームワーク:**  
  - LangChain  
  - neverthrow  
  - zod  
  - ts-pattern

---

## 注意事項

- **環境変数:**  
  - `GITHUB_TOKEN` (GitHub API用)  
  - OpenAIやGoogleのAPIキー

- **ドキュメント:**  
  - [docs/rules.md](../rules.md) に従い、ドキュメントとコードを管理してください。
