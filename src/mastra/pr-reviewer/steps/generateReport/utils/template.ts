import { PullRequestDetails } from "@src/mastra/pr-reviewer/types";

const generateMeta = (prDetails: PullRequestDetails): string => {
  const reportDate = new Date().toISOString();
  return `#+TITLE: プルリクエストレビュー: ${prDetails.title}
#+STARTUP: content
#+STARTUP: fold
#+HTML_HEAD: <link rel="stylesheet" type="text/css" href="https://orgmode.org/worg/style/worg.css"/>
#+DATE: ${reportDate}
#+AUTHOR: AI レビューアシスタント (via prReviewerTool)
#+PROPERTY: PR_URL ${prDetails.html_url}
#+PROPERTY: BASE_SHA ${prDetails.base_sha}
#+PROPERTY: HEAD_SHA ${prDetails.head_sha}`;
};

/**
 * Org Mode 形式のレビューレポートを生成する。
 */
export const generateOrgReport = (
  prDetails: PullRequestDetails,
  result: string,
  summaryReview: string,
  architectureReview: string,
  codeQualityReview: string,
  performanceReview: string,
  securityReview: string,
  testingReview: string,
): string => {
  return `${generateMeta(prDetails)}
* Merge可否

${result}
${summaryReview}
${architectureReview}
${codeQualityReview}
${performanceReview}
${securityReview}
${testingReview}`;
};
