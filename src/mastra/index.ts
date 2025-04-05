
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';

// Import both agents
import { weatherAgent, pullRequestReviewerAgent } from './agents';

export const mastra = new Mastra({
  // Add pullRequestReviewerAgent to the agents object
  agents: { weatherAgent, pullRequestReviewerAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
