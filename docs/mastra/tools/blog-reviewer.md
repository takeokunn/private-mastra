# `src/mastra/tools/blog-reviewer/index.ts` ドキュメント

ブログ記事のレビューと改善提案を行うツール`blogReviewerTool`の仕様を説明します。

## 概要

- 入力として記事の内容またはURLを受け取る。
- LLMを用いて構成・表現・SEO観点でのレビューと提案を生成。
- JSON形式のレビュー結果を返す。

## 入力スキーマ

| フィールド        | 型     | 説明                         |
|-------------------|--------|------------------------------|
| `contentOrUrl`    | string | 記事の本文またはURL          |

## 出力スキーマ

| フィールド     | 型       | 説明                         |
|----------------|----------|------------------------------|
| `summary`      | string   | レビューの要約               |
| `suggestions`  | string[] | 改善提案のリスト             |

## 内部処理

- `executeBlogReviewer()`  
  実際のレビュー処理を行う非同期関数。将来的にLLM API連携予定。

## 依存関係

- `@langchain/core`
- `zod`
- `./execute`
- `./types`
