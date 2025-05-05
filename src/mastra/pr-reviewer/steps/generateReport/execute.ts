import { WorkflowContext } from "@mastra/core";
import { GenerateReportResponse, PullRequest, ReviewResponse } from "@src/mastra/pr-reviewer/types";
import { WORKFLOW } from "../../const";
import { writeReportToFile } from "./utils/output";
import { generateOrgReport } from "./utils/template";

/**
 * PRの情報を取得する
 */
export const execute = async (context: WorkflowContext): Promise<GenerateReportResponse> => {
  const { details, files } = context.getStepResult<PullRequest>(WORKFLOW.FETCH_PULL_REQUEST);
  const { review: architectureReview } = context.getStepResult<ReviewResponse>(WORKFLOW.REVIEW_AGENT.ARCHITECTURE);
  const { review: codeQualityReview } = context.getStepResult<ReviewResponse>(WORKFLOW.REVIEW_AGENT.CODE_QUALITY);
  const { review: performanceReview } = context.getStepResult<ReviewResponse>(WORKFLOW.REVIEW_AGENT.PERFORMANCE);
  const { review: securityReview } = context.getStepResult<ReviewResponse>(WORKFLOW.REVIEW_AGENT.SECURITY);
  const { review: testingReview } = context.getStepResult<ReviewResponse>(WORKFLOW.REVIEW_AGENT.TESTING);

  const report = generateOrgReport(
    details,
    files,
    architectureReview,
    codeQualityReview,
    performanceReview,
    securityReview,
    testingReview,
  );

  const path = await writeReportToFile(report);

  return { path };
};
