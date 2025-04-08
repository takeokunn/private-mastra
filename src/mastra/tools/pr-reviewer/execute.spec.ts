import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fetcherModule from "./fetcher";
import * as outputModule from "./output";
import { executePrReview } from "./execute";

describe("executePrReview", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches PR details, files, diff and generates report", async () => {
    const prUrl = "https://github.com/owner/repo/pull/123";

    const mockDetails = {
      owner: "owner",
      repo: "repo",
      pull_number: 123,
      title: "Test PR",
      body: "Description",
      html_url: prUrl,
      base_sha: "base123",
      head_sha: "head123",
    };
    const mockFiles = [
      { filename: "file1.ts", status: "modified", changes: 10, additions: 5, deletions: 5 },
    ];
    const mockDiff = "diff --git a/file1.ts b/file1.ts\n...";

    fetcherModule.fetchPrDetails = vi.fn().mockResolvedValue(mockDetails);
    fetcherModule.fetchPrFiles = vi.fn().mockResolvedValue(mockFiles);
    fetcherModule.fetchPrDiff = vi.fn().mockResolvedValue(mockDiff);

    const mockReportPath = "/tmp/report.org";
    outputModule.generatePrReviewReport = vi.fn().mockResolvedValue(mockReportPath);

    const result = await executePrReview(prUrl);

    expect(fetcherModule.fetchPrDetails).toHaveBeenCalledWith(prUrl);
    expect(fetcherModule.fetchPrFiles).toHaveBeenCalledWith(mockDetails);
    expect(fetcherModule.fetchPrDiff).toHaveBeenCalledWith(mockDetails);
    expect(outputModule.generatePrReviewReport).toHaveBeenCalledWith({
      prDetails: mockDetails,
      prFiles: mockFiles,
      diff: mockDiff,
    });
    expect(result).toEqual({ reportPath: mockReportPath });
  });
});
