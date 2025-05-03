import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";

import { weatherAgent } from "./weather";
import { prReviewerAgent } from "./pr-reviewer";

export const mastra = new Mastra({
  agents: {
    weatherAgent,
    prReviewerAgent,
  },
  logger: createLogger({ name: "Mastra", level: "info" }),
});
