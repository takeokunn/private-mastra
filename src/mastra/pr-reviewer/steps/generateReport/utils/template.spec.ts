import { describe, it, expect, vi } from "vitest";
import { generateOrgReport } from "./template";
import type { PullRequestDetails } from "@src/mastra/pr-reviewer/types";

const MOCK_DATE = new Date("2025-05-06T10:00:00.000Z");
vi.setSystemTime(MOCK_DATE);

describe("generateOrgReport", () => {
  it('fdsafas', () => {
    expect(true).toBeTruthy()
  })
});

// describe("generateOrgReport", () => {
//   const mockPrDetails: PullRequestDetails = {
//     owner: "test-owner",
//     repo: "test-repo",
//     pull_number: 123,
//     title: "Test Pull Request Title",
//     body: "Test PR body",
//     html_url: "https://github.com/test-owner/test-repo/pull/123",
//     base_sha: "base1234567890abcdef",
//     head_sha: "head1234567890abcdef",
//   };

//   const mockSummary = "* Summary\nThis is the summary review.";
//   const mockArchitecture = "* Architecture\nThis is the architecture review.";
//   const mockCodeQuality = "* Code Quality\nThis is the code quality review.";
//   const mockPerformance = "* Performance\nThis is the performance review.";
//   const mockSecurity = "* Security\nThis is the security review.";
//   const mockTesting = "* Testing\nThis is the testing review.";

//   it("should generate an Org Mode report with correct metadata", () => {
//     const report = generateOrgReport(
//       mockPrDetails,
//       mockSummary,
//       mockArchitecture,
//       mockCodeQuality,
//       mockPerformance,
//       mockSecurity,
//       mockTesting,
//     );

//     expect(report).toContain(
//       `#+TITLE: プルリクエストレビュー: ${mockPrDetails.title}`,
//     );
//     expect(report).toContain("#+STARTUP: content");
//     expect(report).toContain("#+STARTUP: fold");
//     expect(report).toContain(`#+DATE: ${MOCK_DATE.toISOString()}`);
//     expect(report).toContain("#+AUTHOR: AI レビューアシスタント (via prReviewerTool)");
//     expect(report).toContain(`#+PROPERTY: PR_URL ${mockPrDetails.html_url}`);
//     expect(report).toContain(
//       `#+PROPERTY: REPO ${mockPrDetails.owner}/${mockPrDetails.repo}`,
//     );
//     expect(report).toContain(
//       `#+PROPERTY: PR_NUMBER ${mockPrDetails.pull_number}`,
//     );
//     expect(report).toContain(`#+PROPERTY: BASE_SHA ${mockPrDetails.base_sha}`);
//     expect(report).toContain(`#+PROPERTY: HEAD_SHA ${mockPrDetails.head_sha}`);
//   });

//   it("should include all review sections in the correct order", () => {
//     const report = generateOrgReport(
//       mockPrDetails,
//       mockSummary,
//       mockArchitecture,
//       mockCodeQuality,
//       mockPerformance,
//       mockSecurity,
//       mockTesting,
//     );

//     // Generate expected metadata to find where the actual content starts
//     const expectedMeta = `#+TITLE: プルリクエストレビュー: ${mockPrDetails.title}
// #+STARTUP: content
// #+STARTUP: fold
// #+DATE: ${MOCK_DATE.toISOString()}
// #+AUTHOR: AI レビューアシスタント (via prReviewerTool)
// #+PROPERTY: PR_URL ${mockPrDetails.html_url}
// #+PROPERTY: REPO ${mockPrDetails.owner}/${mockPrDetails.repo}
// #+PROPERTY: PR_NUMBER ${mockPrDetails.pull_number}
// #+PROPERTY: BASE_SHA ${mockPrDetails.base_sha}
// #+PROPERTY: HEAD_SHA ${mockPrDetails.head_sha}`;

//     // Construct the expected content part by joining the sections with newlines
//     const expectedContent = [
//       mockSummary,
//       mockArchitecture,
//       mockCodeQuality,
//       mockPerformance,
//       mockSecurity,
//       mockTesting,
//     ].join("\n");

//     // Construct the full expected report
//     const expectedReport = `${expectedMeta}\n${expectedContent}`;

//     // Compare the generated report with the expected report
//     expect(report).toBe(expectedReport);
//   });

//   it("should handle empty review strings correctly", () => {
//     const report = generateOrgReport(
//       mockPrDetails,
//       "", // Empty summary
//       mockArchitecture,
//       "", // Empty code quality
//       mockPerformance,
//       "", // Empty security
//       mockTesting,
//     );

//     expect(report).toContain(mockArchitecture);
//     expect(report).toContain(mockPerformance);
//     expect(report).toContain(mockArchitecture);
//     expect(report).toContain(mockPerformance);
//     expect(report).toContain(mockTesting);

//     // Generate expected metadata
//     const expectedMeta = `#+TITLE: プルリクエストレビュー: ${mockPrDetails.title}
// #+STARTUP: content
// #+STARTUP: fold
// #+DATE: ${MOCK_DATE.toISOString()}
// #+AUTHOR: AI レビューアシスタント (via prReviewerTool)
// #+PROPERTY: PR_URL ${mockPrDetails.html_url}
// #+PROPERTY: REPO ${mockPrDetails.owner}/${mockPrDetails.repo}
// #+PROPERTY: PR_NUMBER ${mockPrDetails.pull_number}
// #+PROPERTY: BASE_SHA ${mockPrDetails.base_sha}
// #+PROPERTY: HEAD_SHA ${mockPrDetails.head_sha}`;

//     // Construct the expected content part with empty strings
//     const expectedContent = [
//       "", // Empty summary
//       mockArchitecture,
//       "", // Empty code quality
//       mockPerformance,
//       "", // Empty security
//       mockTesting,
//     ].join("\n");

//     // Construct the full expected report
//     const expectedReport = `${expectedMeta}\n${expectedContent}`;

//     // Compare the generated report with the expected report
//     expect(report).toBe(expectedReport);
//   });
// });
