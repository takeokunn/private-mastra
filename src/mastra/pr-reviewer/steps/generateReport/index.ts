import { Step } from "@mastra/core";
import { WORKFLOW } from "@src/mastra/pr-reviewer/const";
import { generateOutputSchema } from "@src/mastra/pr-reviewer/schema";
import { execute } from "./execute";

export const step = new Step({
  id: WORKFLOW.GENERATE_REPORT,
  outputSchema: generateOutputSchema,
  execute: async ({ context }) => await execute(context),
});
