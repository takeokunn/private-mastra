# `src/mastra/tools/github.ts` のドキュメント

このファイルは、GitHub APIと対話し、特にプルリクエスト情報を取得するためのツールを定義します。

## 概要

AIエージェントと互換性のあるツールを定義するために `@ai-sdk/react` の `tool` 関数、パラメータ検証のために `zod`、GitHub API呼び出しを行うために `@octokit/rest` を利用します。

**重要:** これらのツールは、GitHub APIでの認証のために `GITHUB_TOKEN` 環境変数が設定されている必要があります。トークンが見つからない場合は警告がログに出力されます。

## エクスポート

### `githubTools`

定義されたGitHubインタラクションツールを含むオブジェクト。

#### `getPullRequestDetails`

特定のGitHubプルリクエストに関する詳細情報を取得するツール。

- **説明:** 'GitHubプルリクエストの詳細（タイトル、説明、作成者、ブランチなど）を取得します。'
- **パラメータ:**
    - `repository`: "owner/repo" 形式の文字列。
    - `pullRequestNumber`: PRの番号。
- **実行:**
    1. `repository` 文字列を owner と repo に解析します。
    2. Octokit の `pulls.get` メソッドを呼び出します。
    3. `title`, `description`, `author`, `baseBranch`, `headBranch` を含むオブジェクトを返します。
    4. エラーハンドリングとロギングを含みます。

#### `getPullRequestDiff`

特定のGitHubプルリクエストのコード変更（差分）を取得するツール。

- **説明:** 'GitHubプルリクエストのコード変更（差分）を取得します。'
- **パラメータ:**
    - `repository`: "owner/repo" 形式の文字列。
    - `pullRequestNumber`: PRの番号。
- **実行:**
    1. `repository` 文字列を owner と repo に解析します。
    2. Octokit の `pulls.get` メソッドを `mediaType: { format: 'diff' }` 付きで呼び出します。
    3. 差分コンテンツを文字列として返します。
    4. エラーハンドリングとロギングを含みます。

## 内部関数

### `parseRepoString(repoString: string)`

リポジトリ文字列（例: "owner/repo"）を受け取り、それを `{ owner: string, repo: string }` オブジェクトに分割するヘルパー関数。形式が無効な場合はエラーをスローします。

## 依存関係

- `@ai-sdk/react`: `tool` 関数用。
- `zod`: スキーマ定義と検証用。
- `@octokit/rest`: GitHub APIとの対話用。
- `process.env.GITHUB_TOKEN`: 認証に必要な環境変数。
