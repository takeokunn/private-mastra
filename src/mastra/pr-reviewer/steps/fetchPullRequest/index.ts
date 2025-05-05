import { Step } from "@mastra/core";
import { fetchPullRequestOutputSchema, workflowInputSchema } from "@src/mastra/pr-reviewer/schema";
import { execute } from "./execute";
import { WORKFLOW } from "@src/mastra/pr-reviewer/const";

export const step = new Step({
  id: WORKFLOW.FETCH_PULL_REQUEST,
  inputSchema: workflowInputSchema,
  outputSchema: fetchPullRequestOutputSchema,
  execute: async ({ context }) => await execute(context),
});
