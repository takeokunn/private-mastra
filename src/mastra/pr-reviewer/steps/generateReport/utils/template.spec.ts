import { describe, it, expect, vi } from "vitest";
import { generateOrgReport } from "./template";
import type { PullRequestDetails } from "@src/mastra/pr-reviewer/types";

// Mock Date to ensure consistent output for #+DATE:
const MOCK_DATE = new Date("2025-05-06T10:00:00.000Z");
vi.setSystemTime(MOCK_DATE);

describe("generateOrgReport", () => {
  const mockPrDetails: PullRequestDetails = {
    owner: "test-owner",
    repo: "test-repo",
    pull_number: 123,
    title: "Test Pull Request Title",
    body: "Test PR body",
    html_url: "https://github.com/test-owner/test-repo/pull/123",
    base_sha: "base1234567890abcdef",
    head_sha: "head1234567890abcdef",
    created_at: "2025-05-05T12:00:00Z",
    updated_at: "2025-05-05T13:00:00Z",
    merged_at: null,
    closed_at: null,
    state: "open",
    user: { login: "test-user" },
    assignees: [],
    requested_reviewers: [],
    labels: [],
    draft: false,
    commits: 1,
    additions: 10,
    deletions: 5,
    changed_files: 2,
  };

  const mockSummary = "* Summary\nThis is the summary review.";
  const mockArchitecture = "* Architecture\nThis is the architecture review.";
  const mockCodeQuality = "* Code Quality\nThis is the code quality review.";
  const mockPerformance = "* Performance\nThis is the performance review.";
  const mockSecurity = "* Security\nThis is the security review.";
  const mockTesting = "* Testing\nThis is the testing review.";

  it("should generate an Org Mode report with correct metadata", () => {
    const report = generateOrgReport(
      mockPrDetails,
      mockSummary,
      mockArchitecture,
      mockCodeQuality,
      mockPerformance,
      mockSecurity,
      mockTesting,
    );

    expect(report).toContain(
      `#+TITLE: プルリクエストレビュー: ${mockPrDetails.title}`,
    );
    expect(report).toContain("#+STARTUP: content");
    expect(report).toContain("#+STARTUP: fold");
    expect(report).toContain(`#+DATE: ${MOCK_DATE.toISOString()}`);
    expect(report).toContain("#+AUTHOR: AI レビューアシスタント (via prReviewerTool)");
    expect(report).toContain(`#+PROPERTY: PR_URL ${mockPrDetails.html_url}`);
    expect(report).toContain(
      `#+PROPERTY: REPO ${mockPrDetails.owner}/${mockPrDetails.repo}`,
    );
    expect(report).toContain(
      `#+PROPERTY: PR_NUMBER ${mockPrDetails.pull_number}`,
    );
    expect(report).toContain(`#+PROPERTY: BASE_SHA ${mockPrDetails.base_sha}`);
    expect(report).toContain(`#+PROPERTY: HEAD_SHA ${mockPrDetails.head_sha}`);
  });

  it("should include all review sections in the correct order", () => {
    const report = generateOrgReport(
      mockPrDetails,
      mockSummary,
      mockArchitecture,
      mockCodeQuality,
      mockPerformance,
      mockSecurity,
      mockTesting,
    );

    // Check if all sections are present and in order
    const expectedOrder = [
      mockSummary,
      mockArchitecture,
      mockCodeQuality,
      mockPerformance,
      mockSecurity,
      mockTesting,
    ];
    const reportLines = report.split("\n");

    let currentIndex = -1;
    for (const section of expectedOrder) {
      // Find the starting line of the section
      const sectionStartIndex = reportLines.findIndex((line) =>
        line.startsWith(section.split("\n")[0]), // Check based on the first line (e.g., "* Summary")
      );
      expect(sectionStartIndex).toBeGreaterThan(currentIndex); // Ensure order
      expect(report).toContain(section); // Ensure the full section content is present
      currentIndex = sectionStartIndex;
    }
  });

  it("should handle empty review strings", () => {
    const report = generateOrgReport(
      mockPrDetails,
      "", // Empty summary
      mockArchitecture,
      "", // Empty code quality
      mockPerformance,
      "", // Empty security
      mockTesting,
    );

    expect(report).toContain(mockArchitecture);
    expect(report).toContain(mockPerformance);
    expect(report).toContain(mockTesting);
    // Check that empty strings result in effectively skipping those sections in the output structure
    // (though they will still be present as empty lines between other sections)
    const lines = report.split('\n');
    const metaEndIndex = lines.findIndex(line => line.startsWith('#+PROPERTY: HEAD_SHA'));
    expect(lines[metaEndIndex + 1]).toBe(mockArchitecture); // Architecture follows meta directly if summary is empty
    expect(lines.find(line => line.includes("Summary"))).toBeUndefined(); // No summary header/content
    expect(lines.find(line => line.includes("Code Quality"))).toBeUndefined();
    expect(lines.find(line => line.includes("Security"))).toBeUndefined();
  });
});
