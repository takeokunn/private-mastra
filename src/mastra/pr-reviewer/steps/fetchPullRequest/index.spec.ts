import { describe, it, expect } from "vitest";
import { step } from "./index";
import { fetchPullRequestOutputSchema, workflowInputSchema } from "@src/mastra/pr-reviewer/schema";
import { WORKFLOW } from "@src/mastra/pr-reviewer/const";

describe("fetchPullRequest Step", () => {
  it("should have the correct id, inputSchema, and outputSchema", () => {
    expect(step.id).toBe(WORKFLOW.FETCH_PULL_REQUEST);
    expect(step.inputSchema).toBe(workflowInputSchema);
    expect(step.outputSchema).toBe(fetchPullRequestOutputSchema);
  });
});
