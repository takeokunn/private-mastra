# `src/mastra/tools/blog-reviewer/index.ts` のドキュメント

このファイルは、ブログ記事をレビューするためのツール (`blogReviewerTool`) を定義し、エクスポートします。

## 概要

`blogReviewerTool` は、ブログ記事の内容またはURLを入力として受け取り、記事の構成、表現、SEOなどの観点から分析し、具体的な改善提案を生成します。内部的には `executeBlogReviewer` 関数を呼び出してレビュー処理を実行します。

## エクスポート

### `blogReviewerTool`

LangChain の `tool` 関数を使用して作成されたツールインスタンスです。

- **機能**: ブログ記事のレビューと改善提案。
- **入力**: `contentOrUrl` (レビュー対象の記事内容またはURL) を含むオブジェクト。入力はZodスキーマ (`blogReviewerSchema`) によってバリデーションされます。
- **出力**: レビュー結果のサマリーと提案リストを含むオブジェクト (`BlogReviewerOutput`)。Toolの制約上、通常は文字列化 (JSON) されて返されます。Agent側でパースする必要があります。
- **説明**: "ブログ記事の内容またはURLを受け取り、構成、表現、SEOなどの観点からレビューし、改善点を提案します。"
- **スキーマ**: `blogReviewerSchema`

## 内部関数

### `executeBlogReviewer` (`./execute.ts`)

実際のレビューロジックを実行する非同期関数です。現在はプレースホルダーとしてダミーの応答を返します。将来的にはLLM API連携などの実装が必要です。

## 型定義 (`./types.ts`)

- `BlogReviewerInput`: ツールの入力型。
- `BlogReviewerOutput`: ツールの出力型。

## 依存関係

- `@langchain/core`: `tool` 関数のため。
- `zod`: 入力バリデーションスキーマ定義のため。
- `./execute`: `executeBlogReviewer` 関数のため。
- `./types`: `BlogReviewerInput`, `BlogReviewerOutput` 型のため。
