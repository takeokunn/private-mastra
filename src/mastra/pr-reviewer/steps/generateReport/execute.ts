import { WorkflowContext } from "@mastra/core";
import { GenerateReportResponse, ReviewResponse } from "../../types";
import { WORKFLOW } from "../../const";
import { writeReportToFile } from "./utils/output";

/**
 * PRの情報を取得する
 */
export const execute = async (context: WorkflowContext): Promise<GenerateReportResponse> => {
  const { review } = context.getStepResult<ReviewResponse>(WORKFLOW.REVIEW_AGENT.ARCHITECTURE);

  const path = await writeReportToFile(review);

  return { path };
};
