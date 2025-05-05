import type { PullRequest, ReviewResponse } from "@src/mastra/pr-reviewer/types";
import { WorkflowContext } from "@mastra/core";
import { z } from "zod";
import { Agent } from "@mastra/core/agent";
import { WORKFLOW } from "../../const";

/**
 * PRの情報を取得する
 */
export const execute = async (context: WorkflowContext, agent: Agent): Promise<ReviewResponse> => {
  const { diff } = context.getStepResult<PullRequest>(WORKFLOW.FETCH_PULL_REQUEST);

  const prompt = `
    # diff

    ${diff}
    `;
  const result = await agent.generate(prompt, {
    output: z.object({
      review: z.string(),
    }),
  });
  return { review: result.object.review };
};
