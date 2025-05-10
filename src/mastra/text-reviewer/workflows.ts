import { Workflow } from "@mastra/core";
import { z } from "zod";
import { workflowInputSchema } from "./schema";

const workflow = new Workflow({
  name: "text-reviewer workflow",
  triggerSchema: z.object({
    inputSchema: workflowInputSchema,
  }),
});

workflow
  // githubの情報取得
  .step(fetchPullRequest)
  .after([fetchPullRequest])
  .commit();

export { workflow };
