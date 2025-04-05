# Documentation for `src/mastra/tools/github.ts`

This file defines tools for interacting with the GitHub API, specifically for retrieving Pull Request information.

## Overview

It utilizes `@ai-sdk/react`'s `tool` function to define tools compatible with AI agents, `zod` for parameter validation, and `@octokit/rest` for making GitHub API calls.

**Important:** These tools require the `GITHUB_TOKEN` environment variable to be set for authentication with the GitHub API. A warning is logged if the token is missing.

## Exports

### `githubTools`

An object containing the defined GitHub interaction tools.

#### `getPullRequestDetails`

A tool to fetch detailed information about a specific GitHub Pull Request.

- **Description:** 'GitHubプルリクエストの詳細（タイトル、説明、作成者、ブランチなど）を取得します。' (Gets details of a GitHub Pull Request like title, description, author, branches, etc.)
- **Parameters:**
    - `repository`: String in "owner/repo" format.
    - `pullRequestNumber`: The number of the PR.
- **Execute:**
    1. Parses the `repository` string into owner and repo.
    2. Calls the Octokit `pulls.get` method.
    3. Returns an object containing `title`, `description`, `author`, `baseBranch`, and `headBranch`.
    4. Includes error handling and logging.

#### `getPullRequestDiff`

A tool to fetch the code changes (diff) for a specific GitHub Pull Request.

- **Description:** 'GitHubプルリクエストのコード変更（差分）を取得します。' (Gets the code changes (diff) of a GitHub Pull Request.)
- **Parameters:**
    - `repository`: String in "owner/repo" format.
    - `pullRequestNumber`: The number of the PR.
- **Execute:**
    1. Parses the `repository` string into owner and repo.
    2. Calls the Octokit `pulls.get` method with `mediaType: { format: 'diff' }`.
    3. Returns the diff content as a string.
    4. Includes error handling and logging.

## Internal Functions

### `parseRepoString(repoString: string)`

A helper function that takes a repository string (e.g., "owner/repo") and splits it into an object `{ owner: string, repo: string }`. Throws an error if the format is invalid.

## Dependencies

- `@ai-sdk/react`: For the `tool` function.
- `zod`: For schema definition and validation.
- `@octokit/rest`: For interacting with the GitHub API.
- `process.env.GITHUB_TOKEN`: Required environment variable for authentication.
