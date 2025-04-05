
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';

// 両方のエージェントをインポート
import { weatherAgent, pullRequestReviewerAgent } from './agents';

export const mastra = new Mastra({
  // pullRequestReviewerAgentをagentsオブジェクトに追加
  agents: { weatherAgent, pullRequestReviewerAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
