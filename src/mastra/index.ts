import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";

import { weatherAgent } from "./weather";

export const mastra = new Mastra({
  agents: { weatherAgent },
  logger: createLogger({ name: "Mastra", level: "info" }),
});
