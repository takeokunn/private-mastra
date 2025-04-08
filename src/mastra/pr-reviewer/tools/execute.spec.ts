import { describe, it, expect, vi, beforeEach } from "vitest";
import { executePrReview } from "../pr-reviewer/execute";

const mockDetails = {
  owner: "owner",
  repo: "repo",
  pull_number: 123,
  title: "Test PR",
  body: "Description",
  html_url: "https://github.com/owner/repo/pull/123",
  base_sha: "base123",
  head_sha: "head123",
};

const mockFiles = [
  { filename: "file1.ts", status: "modified", changes: 10, additions: 5, deletions: 5 },
];

const mockDiff = "diff --git a/file1.ts b/file1.ts\n...";
const mockReportPath = "/tmp/report.org";

vi.mock("../pr-reviewer/fetcher", () => ({
  fetchPrDetails: vi.fn().mockResolvedValue(mockDetails),
  fetchPrFiles: vi.fn().mockResolvedValue(mockFiles),
  fetchPrDiff: vi.fn().mockResolvedValue(mockDiff),
}));

vi.mock("../pr-reviewer/output", () => ({
  generatePrReviewReport: vi.fn().mockResolvedValue(mockReportPath),
}));

describe("executePrReview", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches PR details, files, diff and generates report", async () => {
    const prUrl = "https://github.com/owner/repo/pull/123";
    const result = await executePrReview(prUrl);

    expect(result).toEqual({ reportPath: mockReportPath });
  });
});
