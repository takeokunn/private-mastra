import { describe, it, expect, vi, beforeEach } from "vitest";
import { executePrReview } from "./execute";

// モックするデータをここで定義
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

const mockFiles = [{ filename: "file1.ts", status: "modified", changes: 10, additions: 5, deletions: 5 }];

const mockDiff = "diff --git a/file1.ts b/file1.ts\n...";
const mockReportPath = "/tmp/report.org";

vi.mock("./fetcher", () => ({
  getPrDetails: vi.fn(() => mockDetails),
  getPrFiles: vi.fn(() => mockFiles),
  getPrDiff: vi.fn(() => mockDiff),
}));

vi.mock("./output", () => ({
  generateOrgReport: vi.fn(() => mockReportPath),
  writeReportToFile: vi.fn(() => mockReportPath),
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
