import { PullRequestDetails } from "@src/mastra/pr-reviewer/types";

const generateMeta = (prDetails: PullRequestDetails): string => {
  const reportDate = new Date().toISOString();
  return `#+TITLE: プルリクエストレビュー: ${prDetails.title}
#+STARTUP: content
#+STARTUP: fold
#+DATE: ${reportDate}
#+AUTHOR: AI レビューアシスタント (via prReviewerTool)
#+PROPERTY: PR_URL ${prDetails.html_url}
#+PROPERTY: REPO ${prDetails.owner}/${prDetails.repo}
#+PROPERTY: PR_NUMBER ${prDetails.pull_number}
#+PROPERTY: BASE_SHA ${prDetails.base_sha}
#+PROPERTY: HEAD_SHA ${prDetails.head_sha}`;
};

/**
 * Org Mode 形式のレビューレポートを生成する。
 */
export const generateOrgReport = (
  prDetails: PullRequestDetails,
  summaryReview: string,
  architectureReview: string,
  codeQualityReview: string,
  performanceReview: string,
  securityReview: string,
  testingReview: string,
): string => {
  return `${generateMeta(prDetails)}
${summaryReview}
${architectureReview}
${codeQualityReview}
${performanceReview}
${securityReview}
${testingReview}`;
};
