import { PullRequestDetails, PullRequestFileInfo } from "@src/mastra/pr-reviewer/types";

const generateMeta = (prDetails: PullRequestDetails): string => {
  const reportDate = new Date().toISOString();
  return `#+TITLE: プルリクエストレビュー: ${prDetails.title}
#+DATE: ${reportDate}
#+AUTHOR: AI レビューアシスタント (via prReviewerTool)
#+PROPERTY: PR_URL ${prDetails.html_url}
#+PROPERTY: REPO ${prDetails.owner}/${prDetails.repo}
#+PROPERTY: PR_NUMBER ${prDetails.pull_number}
#+PROPERTY: BASE_SHA ${prDetails.base_sha}
#+PROPERTY: HEAD_SHA ${prDetails.head_sha}
`
}

const generateDescription = (prDetails: PullRequestDetails): string => {
  return `
* PR 詳細

- *タイトル*: ${prDetails.title}
- *URL*: ${prDetails.html_url}
`
}

const generateSummary = (files: PullRequestFileInfo[]): string => {
  const fileSummary = files.map((f) => `- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`).join("\n");
  return `
* 変更概要
** 変更ファイル (${files.length})
${fileSummary || "変更されたファイルがないか、ファイルリストを取得できませんでした。"}
`
}

/**
 * Org Mode 形式のレビューレポートを生成する。
 */
export const generateOrgReport = (
  prDetails: PullRequestDetails,
  files: PullRequestFileInfo[],
  architectureReview: string,
  codeQualityReview: string,
  performanceReview: string,
  securityReview: string,
  testingReview: string
): string => {
  return `${generateMeta(prDetails)}
${generateDescription(prDetails)}
${generateSummary(files)}
${architectureReview}
${codeQualityReview}
${performanceReview}
${securityReview}
${testingReview}
`;
};
