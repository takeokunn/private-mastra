# PR Reviewer Tool (`prReviewerTool`)

## 概要

`prReviewerTool` は、指定された GitHub Pull Request (PR) の URL を受け取り、GitHub API を使用して PR 情報を取得し、基本的なレビューレポートを Org Mode 形式で生成する Mastra ツールです。

## 目的

*   GitHub PR の情報をプログラム的に取得します。
*   PR の概要、変更ファイルリスト、差分などの情報を含む構造化されたレポートを生成します。
*   エージェントが PR レビュープロセスを支援するための基盤を提供します。

## 機能

1.  **PR URL 解析:** GitHub PR の URL からリポジトリ所有者、リポジトリ名、PR 番号を抽出します。
2.  **GitHub API 連携:**
    *   `@octokit/rest` を使用して GitHub API と通信します。
    *   PR の詳細情報（タイトル、本文、ベース/ヘッド SHA など）を取得します。
    *   変更されたファイルのリスト（ファイル名、ステータス、変更行数）を取得します。
    *   PR の差分（diff）を取得します。
3.  **レポート生成:** 取得した情報に基づいて、Org Mode 形式のレポート文字列を生成します。
4.  **ファイル書き込み:** 生成されたレポートを指定されたディレクトリ (`.claude/output/`) にタイムスタンプ付きのファイル名で保存します。
5.  **エラーハンドリング:** API 呼び出しやファイル書き込み中のエラーを `Result` 型を使用して処理します。

## 入力スキーマ (`inputSchema`)

*   `prUrl` (string, URL): レビュー対象の GitHub Pull Request の完全な URL。

## 出力スキーマ (`outputSchema`)

*   `reportPath` (string): 生成された Org Mode レポートファイルの絶対パス。

## 依存関係

*   `@mastra/core/tools`: `createTool` 関数用。
*   `@octokit/rest`: GitHub API との通信用。
*   `neverthrow`: エラーハンドリングのための `Result` 型用。
*   `zod`: 入出力スキーマ定義用。
*   `path`, `fs/promises`: ファイルパス操作とファイルシステム操作用。
*   環境変数 `GITHUB_TOKEN`: GitHub API 認証に必要です。

## 注意事項

*   このツールは GitHub API へのアクセスが必要です。有効な `GITHUB_TOKEN` 環境変数が設定されていることを確認してください。
*   レポートの分析内容は現時点では基本的な情報取得とプレースホルダーが中心です。静的解析やテスト実行などの高度な分析は含まれていません。
*   レポートはプロジェクトルートの `.claude/output/` ディレクトリに保存されます。
