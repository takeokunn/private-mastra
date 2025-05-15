import { google } from "@ai-sdk/google";
import { tool as githubTool } from "./integrations/github";
import { Agent } from "@mastra/core/agent";
import { Step } from "@mastra/core";
import { match } from "ts-pattern";
import { WORKFLOW } from "@src/mastra/pr-reviewer/const";
import { fetchPullRequestOutputSchema, reviewAgentOutputSchema } from "../../schema";
import { execute } from "./execute";
import type { ReviewType } from "@src/mastra/pr-reviewer/types";
import {
  summaryInstructions,
  architectureInstructions,
  codeQualityInstructions,
  performanceInstructions,
  securityInstructions,
  testingInstructions,
} from "./instructions";

export const step = (reviewType: ReviewType) => {
  const id = match(reviewType)
    .with("summary", () => WORKFLOW.REVIEW_AGENT.SUMMARY)
    .with("architecture", () => WORKFLOW.REVIEW_AGENT.ARCHITECTURE)
    .with("code_quality", () => WORKFLOW.REVIEW_AGENT.CODE_QUALITY)
    .with("performance", () => WORKFLOW.REVIEW_AGENT.PERFORMANCE)
    .with("security", () => WORKFLOW.REVIEW_AGENT.SECURITY)
    .with("testing", () => WORKFLOW.REVIEW_AGENT.TESTING)
    .exhaustive();

  const instructions = match(reviewType)
    .with("summary", () => summaryInstructions)
    .with("architecture", () => architectureInstructions)
    .with("code_quality", () => codeQualityInstructions)
    .with("performance", () => performanceInstructions)
    .with("security", () => securityInstructions)
    .with("testing", () => testingInstructions)
    .exhaustive();

  const agent = new Agent({
    name: "Pull Request Agent",
    instructions,
    model: google("gemini-1.5-flash-latest"),
    tools: { githubTool },
  });

  return new Step({
    id,
    inputSchema: fetchPullRequestOutputSchema,
    outputSchema: reviewAgentOutputSchema,
    execute: async ({ context }) => await execute(context, agent),
  });
};
