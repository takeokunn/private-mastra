import { Step } from "@mastra/core";
import { match } from "ts-pattern";
import { WORKFLOW } from "@src/mastra/pr-reviewer/const";
import { fetchPullRequestOutputSchema, reviewAgentOutputSchema } from "../../schema";
import {
  architectureAgent,
  codeQualityAgent,
  performanceAgent,
  securityAgent,
  summaryAgent,
  testingAgent,
} from "./agents";
import { execute } from "./execute";

type ReviewType = "summary" | "architecture" | "code_quality" | "performance" | "security" | "testing";

export const step = (reviewType: ReviewType) => {
  const id = match(reviewType)
    .with("summary", () => WORKFLOW.REVIEW_AGENT.SUMMARY)
    .with("architecture", () => WORKFLOW.REVIEW_AGENT.ARCHITECTURE)
    .with("code_quality", () => WORKFLOW.REVIEW_AGENT.CODE_QUALITY)
    .with("performance", () => WORKFLOW.REVIEW_AGENT.PERFORMANCE)
    .with("security", () => WORKFLOW.REVIEW_AGENT.SECURITY)
    .with("testing", () => WORKFLOW.REVIEW_AGENT.TESTING)
    .exhaustive();

  const agent = match(reviewType)
    .with("summary", () => summaryAgent)
    .with("architecture", () => architectureAgent)
    .with("code_quality", () => codeQualityAgent)
    .with("performance", () => performanceAgent)
    .with("security", () => securityAgent)
    .with("testing", () => testingAgent)
    .exhaustive();

  return new Step({
    id,
    inputSchema: fetchPullRequestOutputSchema,
    outputSchema: reviewAgentOutputSchema,
    execute: async ({ context }) => await execute(context, agent),
  });
};
