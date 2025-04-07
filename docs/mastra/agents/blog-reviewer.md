# `src/mastra/agents/blog-reviewer.ts` のドキュメント

このファイルは、ブログ記事のレビューを行うためのエージェント (`blogReviewerAgent`) を定義し、エクスポートします。

## 概要

`blogReviewerAgent` は、ユーザーからの指示（レビュー対象の記事情報）を受け取り、`blogReviewerTool` を利用して記事を分析し、改善提案を生成する役割を担います。LLM（例: OpenAI GPT）と連携して動作します。このファイルは `AgentExecutor` インスタンスをエクスポートします。

## エクスポート

### `blogReviewerAgent`

LangChain の `AgentExecutor` インスタンスです。`createToolCallingAgent` を使用して作成されたAgentロジックとツールを実行します。

- **目的**: ブログ記事のレビュープロセスを管理・実行する。
- **使用ツール**: `blogReviewerTool`
- **基盤モデル**: `ChatOpenAI` (設定可能)
- **プロンプト**: システムメッセージで役割を定義し、人間からの入力を受け付け、Agentの思考プロセス (`agent_scratchpad`) を組み込むテンプレートを使用します。

## 設定と実行

- **モデル**: `ChatOpenAI` のインスタンスが使用されます。APIキーやモデル名は適宜設定が必要です。
- **ツール**: `blogReviewerTool` がエージェントに提供されます。
- **実行**: エクスポートされた `blogReviewerAgent` の `.invoke()` メソッドなどを呼び出すことで、ブログレビュープロセスを開始できます。入力として `{ input: "レビュー対象の記事内容またはURL" }` のような形式でデータを提供します。

## 依存関係

- `@langchain/core`: プロンプトテンプレート、モデル、ツール関連。
- `@langchain/openai`: OpenAIモデル用。
- `langchain/agents`: `AgentExecutor`, `createToolCallingAgent` のため。
- `../tools/blog-reviewer`: `blogReviewerTool` のため。
