import { Workflow } from "@mastra/core";
import { z } from "zod";
import { workflowInputSchema } from "./schema";
import { step as fetchPullRequest } from "./steps/fetchPullRequest";
import { step as generateReport } from "./steps/generateReport";
import { step as reviewAgent } from "./steps/reviewAgent";

const workflow = new Workflow({
  name: "pr-review workflow",
  triggerSchema: z.object({
    inputSchema: workflowInputSchema,
  }),
});

const reviewAgents = {
  architecture: reviewAgent("architecture"),
  codeQuality: reviewAgent("code_quality"),
  performance: reviewAgent("performance"),
  security: reviewAgent("security"),
  testing: reviewAgent("testing"),
};

workflow
  // githubの情報取得
  .step(fetchPullRequest)
  .after([fetchPullRequest])

  // レビューエージェント実行
  .step(reviewAgents.architecture)
  .step(reviewAgents.codeQuality)
  .step(reviewAgents.performance)
  .step(reviewAgents.security)
  .step(reviewAgents.testing)
  .after([
    reviewAgents.architecture,
    reviewAgents.codeQuality,
    reviewAgents.performance,
    reviewAgents.security,
    reviewAgents.testing,
  ])

  // レポート作成
  .step(generateReport)
  .commit();

export { workflow };
