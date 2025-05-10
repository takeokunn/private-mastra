import { Step } from "@mastra/core";
import { execute } from "./execute";

export const step = new Step({
  id: WORKFLOW.FETCH_PULL_REQUEST,
  inputSchema: workflowInputSchema,
  outputSchema: fetchPullRequestOutputSchema,
  execute: async ({ context }) => await execute(context),
});
