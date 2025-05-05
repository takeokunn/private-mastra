import { z } from "zod";
import { WorkflowContext } from "@mastra/core";
import { GenerateReportResponse, PullRequest, ReviewResponse } from "@src/mastra/pr-reviewer/types";
import { WORKFLOW } from "../../const";
import { writeReportToFile } from "./utils/output";
import { generateOrgReport } from "./utils/template";
import { agent } from "./agent";

/**
 * PRの情報を取得する
 */
export const execute = async (context: WorkflowContext): Promise<GenerateReportResponse> => {
  const { details } = context.getStepResult<PullRequest>(WORKFLOW.FETCH_PULL_REQUEST);
  const { review: summaryReview } = context.getStepResult<ReviewResponse>(WORKFLOW.REVIEW_AGENT.SUMMARY);
  const { review: architectureReview } = context.getStepResult<ReviewResponse>(WORKFLOW.REVIEW_AGENT.ARCHITECTURE);
  const { review: codeQualityReview } = context.getStepResult<ReviewResponse>(WORKFLOW.REVIEW_AGENT.CODE_QUALITY);
  const { review: performanceReview } = context.getStepResult<ReviewResponse>(WORKFLOW.REVIEW_AGENT.PERFORMANCE);
  const { review: securityReview } = context.getStepResult<ReviewResponse>(WORKFLOW.REVIEW_AGENT.SECURITY);
  const { review: testingReview } = context.getStepResult<ReviewResponse>(WORKFLOW.REVIEW_AGENT.TESTING);

  const prompt = `
## 命令

以下の情報を元に、PRのレビューを行ってください。

## 出力

[以下から1文選択する]

- MERGE: このPRはプロジェクトに価値をもたらし、リスクは最小限です。
- MERGE WITH CAUTION: マージ可能ですが、[具体的な懸念事項]について注意が必要です。[推奨される予防措置]を取った上でマージすることを推奨します。
- NEEDS REVISION: 現状ではマージを推奨できません。[具体的な問題点]があり、[提案される対応策]が必要です。
- DO NOT MERGE: このPRには[具体的な重大な問題]があり、マージするとプロジェクトに[具体的なリスク/損害]をもたらす可能性が高いです。

[3-5文で選択理由を詳細に説明、人間が読みやすいように文章は適宜改行]

## 入力情報

\`\`\`org

${summaryReview}
${architectureReview}
${codeQualityReview}
${performanceReview}
${securityReview}
${testingReview}
\`\`\`
`;
  const result = await agent.generate(prompt, {
    output: z.object({
      review: z.string(),
    }),
  });

  const report = generateOrgReport(
    details,
    result.object.review,
    summaryReview,
    architectureReview,
    codeQualityReview,
    performanceReview,
    securityReview,
    testingReview,
  );

  const path = await writeReportToFile(report);

  return { path };
};
