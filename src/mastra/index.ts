import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";

import { weatherAgent } from "./weather";
import { prReviewWorkflow } from "./pr-reviewer";

export const mastra = new Mastra({
  agents: {
    weatherAgent,
  },
  workflows: {
    prReviewWorkflow,
  },
  logger: createLogger({ name: "Mastra", level: "info" }),
});
