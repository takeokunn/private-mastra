import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";

import { weatherAgent } from "./weather";
import { prReviewerAgent } from "./pr-reviewer";
import { blogReviewerAgent } from "./blog-reviewer";
import { designDocsReviewerAgent } from "./design-docs-reviewer";
import { adrReviewerAgent } from "./adr-review";

export const mastra = new Mastra({
  agents: {
    weatherAgent,
    prReviewerAgent,
    blogReviewerAgent,
    designDocsReviewerAgent,
    adrReviewerAgent,
  },
  logger: createLogger({ name: "Mastra", level: "info" }),
});
