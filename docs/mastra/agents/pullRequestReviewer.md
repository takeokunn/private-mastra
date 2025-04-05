# Documentation for `src/mastra/agents/pullRequestReviewer.ts`

This file defines the `pullRequestReviewerAgent`, an AI assistant specialized in reviewing GitHub Pull Requests.

## Overview

It imports the `Agent` class, the Google AI model, and specific GitHub tools (`getPullRequestDetails`, `getPullRequestDiff`) required for its function.

## Exports

### `pullRequestReviewerAgent`

An instance of the `Agent` class configured as a code reviewer.

- **Name:** 'Pull Request Reviewer Agent'
- **Instructions:** Detailed steps for the agent to follow when reviewing a PR:
    1. Use `getPullRequestDetails` for context.
    2. Use `getPullRequestDiff` for code changes.
    3. Analyze based on clarity, appropriateness, potential issues, and best practices.
    4. Provide a concise review summary.
    5. Mention specific lines if necessary, avoiding long snippets.
    6. Requires repository name and PR number to start.
- **Model:** Uses `google('gemini-1.5-pro-latest')`.
- **Tools:** Equipped with `getPullRequestDetails` and `getPullRequestDiff` from `../tools`.

## Dependencies

- `@ai-sdk/google`: For the AI model.
- `@mastra/core/agent`: For the `Agent` class.
- `../tools`: For the `getPullRequestDetails` and `getPullRequestDiff` tools.
