# Documentation for `src/mastra/index.ts`

This file serves as the main entry point for initializing and exporting the Mastra instance.

## Overview

It imports the core `Mastra` class, the `createLogger` function, and the defined agents (`weatherAgent`, `pullRequestReviewerAgent`). It then configures and exports a single `mastra` instance.

## Exports

### `mastra`

An instance of the `Mastra` class.

- **Agents:** Configured with `weatherAgent` and `pullRequestReviewerAgent`.
- **Logger:** Uses `createLogger` to create a logger named 'Mastra' with an 'info' level.

## Usage

This instance can be imported elsewhere in the application to interact with the configured agents.

```typescript
import { mastra } from './path/to/mastra/index';

// Example: Interact with an agent
// mastra.runAgent('weatherAgent', { location: 'Tokyo' });
```
