# Documentation for `src/mastra/agents/index.ts`

This file defines and exports the available agents within the Mastra application.

## Overview

It imports necessary components like `Agent` from `@mastra/core/agent`, AI models (`google`), and tools (`weatherTool`). It defines the `weatherAgent` directly and re-exports the `pullRequestReviewerAgent` from its dedicated module.

## Exports

### `weatherAgent`

An instance of the `Agent` class configured as a weather assistant.

- **Name:** 'Weather Agent'
- **Instructions:** Guides the agent to provide weather information, ask for location if missing, translate non-English locations, handle multi-part locations, include relevant details, and keep responses concise.
- **Model:** Uses `google('gemini-1.5-pro-latest')`.
- **Tools:** Equipped with the `weatherTool` to fetch weather data.

### `pullRequestReviewerAgent`

Re-exported from `./pullRequestReviewer`. See `docs/mastra/agents/pullRequestReviewer.md` for details.

## Dependencies

- `@ai-sdk/google`: For the AI model.
- `@mastra/core/agent`: For the `Agent` class.
- `../tools`: For the `weatherTool`.
- `./pullRequestReviewer`: For the `pullRequestReviewerAgent`.
