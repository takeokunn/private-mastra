import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';

import { weatherAgent, pullRequestReviewerAgent } from './agents';

export const mastra = new Mastra({
  agents: { weatherAgent, pullRequestReviewerAgent },
  logger: createLogger({ name: 'Mastra', level: 'info' }),
});
