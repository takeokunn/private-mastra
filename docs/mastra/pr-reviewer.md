# Mastra PR Reviewer ドキュメント

このドキュメントは、Mastra プロジェクト内の `pr-reviewer` モジュールの概要を提供します。このモジュールは、AI エージェントを使用して GitHub Pull Request を自動的にレビューするように設計されています。

## 概要

`pr-reviewer` モジュールは、Pull Request データの取得、さまざまな側面（コード品質、セキュリティ、パフォーマンスなど）に基づいたレビューの実行、および結果を要約したレポートの生成を行ういくつかのステップを調整するワークフロー (`reviewPullRequestWorkflow`) を定義します。

## 主要コンポーネント

### 1. エントリーポイント (`src/mastra/pr-reviewer/index.ts`)

このファイルは `pr-reviewer` モジュールのメインエントリーポイントとして機能し、主要なワークフローと関連する型をエクスポートします。

-   **エクスポート**:
    -   `reviewPullRequestWorkflow`: メインのワークフロー関数。
    -   ワークフローの入力と出力に関連する型とスキーマ。

### 2. ワークフロー (`src/mastra/pr-reviewer/workflows.ts`)

Pull Request をレビューするためのメインワークフローを定義します。

-   **`reviewPullRequestWorkflow`**:
    -   GitHub Pull Request の URL を入力として受け取ります。
    -   定義されたステップ (`fetchPullRequest`, `reviewAgent`, `generateReport`) の実行を調整します。
    -   入力検証と出力構造の定義のために Zod スキーマ (`reviewPullRequestInputSchema`, `reviewPullRequestOutputSchema`) を使用します。

### 3. ワークフローステップ (`src/mastra/pr-reviewer/steps/`)

ワークフローは、レビュープロセスの特定のパートを担当する個別のステップで構成されています。

#### a. `fetchPullRequest`

-   **目的**: 指定された Pull Request URL の詳細、ファイル、および差分情報を取得します。
-   **ディレクトリ**: `src/mastra/pr-reviewer/steps/fetchPullRequest/`
-   **主要ファイル**:
    -   `index.ts`: `createStep` を使用してステップを定義します。
    -   `execute.ts`: ステップの主要な実行ロジックを含みます。URL を解析し、フェッチャーユーティリティを使用します。
    -   `utils/parse.ts`: GitHub Pull Request URL を解析するためのユーティリティ関数 (`parsePullRequestUrl`)。
    -   `utils/fetcher.ts`: GitHub API (Octokit を使用) と対話して PR データを取得するためのユーティリティ関数 (`fetchPullRequestDetails`, `fetchPullRequestFiles`, `fetchPullRequestDiff`)。

#### b. `reviewAgent`

-   **目的**: 指定された指示に基づいて、AI エージェントを使用して Pull Request の差分を実際にレビューします。
-   **ディレクトリ**: `src/mastra/pr-reviewer/steps/reviewAgent/`
-   **主要ファイル**:
    -   `index.ts`: `createStep` を使用してステップを定義します。
    -   `execute.ts`: 主要な実行ロジックを含みます。さまざまなレビュータイプ (summary, architecture, code quality など) を反復処理し、指示を使用してプロンプトを準備し、AI エージェントを呼び出し、オプションで GitHub にコメントを投稿します。
    -   `instructions/`: 各レビュー側面 (例: `basic.ts`, `security.ts`, `performance.ts`) に対する AI エージェントへの具体的な指示を含みます。`index.ts` はすべての指示をエクスポートします。
    -   `integrations/github.ts`: 生成されたレビューコメントを GitHub Pull Request に投稿するためのユーティリティ関数 (`postReviewComment`)。

#### c. `generateReport`

-   **目的**: `reviewAgent` ステップからのレビューを要約した最終レポートを生成します。
-   **ディレクトリ**: `src/mastra/pr-reviewer/steps/generateReport/`
-   **主要ファイル**:
    -   `index.ts`: `createStep` を使用してステップを定義します。
    -   `execute.ts`: 主要な実行ロジックを含みます。`generateReportAgent` を使用してレビューをレポートに統合し、出力ユーティリティを使用して保存します。
    -   `agent.ts`: 収集されたレビューに基づいて最終レポートを生成するように特別に構成された AI エージェント (`generateReportAgent`) を定義します。
    -   `utils/template.ts`: 最終レポートの内容を構造化するためのテンプレート関数 (`getReportTemplate`) を提供します。
    -   `utils/output.ts`: 生成されたレポートを Markdown ファイルに保存するためのユーティリティ関数 (`saveReport`)。

### 4. データ型 (`src/mastra/pr-reviewer/types.ts`)

このファイルは、`pr-reviewer` モジュール全体で使用されるコア TypeScript 型を定義します。

-   **主要な型**:
    -   `PullRequestUrlParts`: 解析された PR URL コンポーネントの構造。
    -   `PullRequestDetails`: PR に関する詳細情報 (タイトル、本文、SHA など)。
    -   `PullRequestFileInfo`: PR で変更されたファイルに関する情報。
    -   `PullRequest`: parts, details, files, diff を含む集約型。
    -   `ReviewResponse`: 単一のレビュー側面の出力の構造。
    -   `GenerateReportResponse`: レポート生成ステップの出力の構造 (レポートへのパス)。
    -   `ReviewType`: さまざまなレビュー側面 (summary, architecture など) を定義する Enum ライクな型。

### 5. スキーマ (`src/mastra/pr-reviewer/schema.ts`)

ワークフローとそのステップの入力と出力を検証するための Zod スキーマを定義します。

-   **主要なスキーマ**:
    -   `PullRequestUrlPartsSchema`: `PullRequestUrlParts` のスキーマ。
    -   `PullRequestDetailsSchema`: `PullRequestDetails` のスキーマ。
    -   `PullRequestFileInfoSchema`: `PullRequestFileInfo` のスキーマ。
    -   `PullRequestSchema`: `PullRequest` のスキーマ。
    -   `ReviewResponseSchema`: `ReviewResponse` のスキーマ。
    -   `GenerateReportResponseSchema`: `GenerateReportResponse` のスキーマ。
    -   `reviewPullRequestInputSchema`: メインワークフローの入力スキーマ。
    -   `reviewPullRequestOutputSchema`: メインワークフローの出力スキーマ。

### 6. 定数 (`src/mastra/pr-reviewer/const.ts`)

モジュール内で使用される定数値を含みます。

-   **`REVIEW_TYPES`**: `reviewAgent` ステップで使用される定義済みの `ReviewType` 値すべてをリストする配列。

## 動作の仕組み

1.  `reviewPullRequestWorkflow` は GitHub PR の URL を受け取ります。
2.  `fetchPullRequest` ステップは URL を解析し、GitHub から PR の詳細、変更されたファイル、および差分を取得します。
3.  `reviewAgent` ステップは `REVIEW_TYPES` で定義された各 `ReviewType` を反復処理します。各タイプについて:
    -   `instructions/` ディレクトリからの対応する指示と取得した PR データ (差分) を使用してプロンプトを構築します。
    -   プロンプトを使用して AI エージェントを呼び出し、その特定の側面に関するレビューを取得します。
    -   オプションで、`integrations/github.ts` を使用してレビューを GitHub PR にコメントとして投稿します。
4.  `generateReport` ステップは `reviewAgent` によって生成されたすべての個別のレビューを受け取ります。
    -   別の AI エージェント (`generateReportAgent`) とテンプレート (`utils/template.ts`) を使用して、統合された Markdown レポートを作成します。
    -   `utils/output.ts` を使用してレポートをファイルに保存します。
5.  ワークフローは生成されたレポートへのパスを返します。
