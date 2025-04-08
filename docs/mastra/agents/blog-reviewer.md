# `src/mastra/agents/blog-reviewer.ts` ドキュメント

ブログ記事のレビューを行うAIエージェント`blogReviewerAgent`の仕様を説明します。

## 概要

- `Agent`クラスを用いて構築。
- `blogReviewerTool`をツールとして利用。
- LLM（例: OpenAI GPTやGemini）と連携し、記事の構成・表現・SEO観点での改善提案を生成。

## 特徴

- **名前:** `"Blog Reviewer Agent"`
- **指示内容:**
  - ブログ記事の内容やURLを受け取り、レビューと改善提案を行う。
  - 文章構成、表現、SEOの観点で具体的なアドバイスを生成。
- **モデル:** `ChatOpenAI`や`google('gemini-1.5-pro-latest')`など
- **ツール:** `blogReviewerTool`

## 使用例

```plaintext
ユーザー: このブログ記事をレビューしてください: https://example.com/post

エージェント: レビュー結果と改善提案を以下に示します...
```

## 依存関係

- `@langchain/core`
- `@langchain/openai`
- `langchain/agents`
- `../tools/blog-reviewer` (`blogReviewerTool`)
