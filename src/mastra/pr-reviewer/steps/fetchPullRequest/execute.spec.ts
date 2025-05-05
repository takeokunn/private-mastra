import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeFetchPullRequestStep as execute } from "./execute"; // Renaming for clarity if needed, or keep as execute
import { parsePullRequestUrl } from "../utils/parse";
import { getPrDetails, getPrFiles, getPrDiff } from "../utils/fetcher";
import type {
  PullRequestUrlParts,
  PullRequestDetails,
  PullRequestFileInfo,
} from "../types";

const mockPullRequestUrl = "https://github.com/owner/repo/pull/123";

const mockUrlParts: PullRequestUrlParts = {
  owner: "owner",
  repo: "repo",
  pull_number: 123,
};

const mockDetails: PullRequestDetails = {
  owner: "owner",
  repo: "repo",
  pull_number: 123,
  title: "Test PR",
  body: "Description",
  html_url: "https://github.com/owner/repo/pull/123",
  base_sha: "base123",
  head_sha: "head123",
};

const mockDetailsNullBody: PullRequestDetails = {
  ...mockDetails,
  body: null,
};

const mockFiles: PullRequestFileInfo[] = [
  {
    filename: "file1.ts",
    status: "modified",
    changes: 10,
    additions: 5,
    deletions: 5,
  },
];

const mockDiff = "diff --git a/file1.ts b/file1.ts\n...";
// const mockReportPath = "/tmp/report.org"; // This seems related to a different step/logic

// Mock the dependencies
vi.mock("../utils/parse", () => ({
  parsePullRequestUrl: vi.fn(),
}));

vi.mock("../utils/fetcher", () => ({
  getPrDetails: vi.fn(),
  getPrFiles: vi.fn(),
  getPrDiff: vi.fn(),
}));

// We are testing the execute function of fetchPullRequest step,
// so we don't mock the output utils here unless execute itself uses them directly.
// vi.mock("./utils/output", () => ({
//   generateOrgReport: vi.fn(() => mockReportPath),
//   writeReportToFile: vi.fn(() => mockReportPath),
// }));

describe("executeFetchPullRequestStep", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Setup default mock implementations for success cases
    vi.mocked(parsePullRequestUrl).mockReturnValue(mockUrlParts);
    vi.mocked(getPrDetails).mockResolvedValue(mockDetails);
    vi.mocked(getPrFiles).mockResolvedValue(mockFiles);
    vi.mocked(getPrDiff).mockResolvedValue(mockDiff);
  });

  it("should fetch pull request details, files, and diff successfully", async () => {
    const result = await execute(mockPullRequestUrl);

    expect(parsePullRequestUrl).toHaveBeenCalledWith(mockPullRequestUrl);
    expect(getPrDetails).toHaveBeenCalledWith(mockUrlParts);
    expect(getPrFiles).toHaveBeenCalledWith(mockUrlParts);
    expect(getPrDiff).toHaveBeenCalledWith(mockUrlParts);
    expect(result).toEqual({
      parts: mockUrlParts,
      details: mockDetails,
      files: mockFiles,
      diff: mockDiff,
    });
  });

  it("should handle pull requests with a null body", async () => {
    vi.mocked(getPrDetails).mockResolvedValue(mockDetailsNullBody); // Override mock for this test

    const result = await execute(mockPullRequestUrl);

    expect(getPrDetails).toHaveBeenCalledWith(mockUrlParts);
    expect(result).toEqual({
      parts: mockUrlParts,
      details: mockDetailsNullBody, // Expect the details with null body
      files: mockFiles,
      diff: mockDiff,
    });
  });

  it("should throw an error if the pull request URL is invalid", async () => {
    const error = new Error("Invalid URL format");
    vi.mocked(parsePullRequestUrl).mockImplementation(() => {
      throw error;
    });

    await expect(execute(mockPullRequestUrl)).rejects.toThrow(error);

    expect(parsePullRequestUrl).toHaveBeenCalledWith(mockPullRequestUrl);
    expect(getPrDetails).not.toHaveBeenCalled();
    expect(getPrFiles).not.toHaveBeenCalled();
    expect(getPrDiff).not.toHaveBeenCalled();
  });

  it("should throw an error if fetching details fails", async () => {
    const error = new Error("Failed to fetch PR details");
    vi.mocked(getPrDetails).mockRejectedValue(error);

    await expect(execute(mockPullRequestUrl)).rejects.toThrow(error);

    expect(parsePullRequestUrl).toHaveBeenCalledWith(mockPullRequestUrl);
    expect(getPrDetails).toHaveBeenCalledWith(mockUrlParts);
    expect(getPrFiles).not.toHaveBeenCalled(); // Should not proceed
    expect(getPrDiff).not.toHaveBeenCalled();
  });

  it("should throw an error if fetching files fails", async () => {
    const error = new Error("Failed to fetch PR files");
    vi.mocked(getPrFiles).mockRejectedValue(error);

    await expect(execute(mockPullRequestUrl)).rejects.toThrow(error);

    expect(parsePullRequestUrl).toHaveBeenCalledWith(mockPullRequestUrl);
    expect(getPrDetails).toHaveBeenCalledWith(mockUrlParts);
    expect(getPrFiles).toHaveBeenCalledWith(mockUrlParts);
    expect(getPrDiff).not.toHaveBeenCalled(); // Should not proceed
  });

  it("should throw an error if fetching diff fails", async () => {
    const error = new Error("Failed to fetch PR diff");
    vi.mocked(getPrDiff).mockRejectedValue(error);

    await expect(execute(mockPullRequestUrl)).rejects.toThrow(error);

    expect(parsePullRequestUrl).toHaveBeenCalledWith(mockPullRequestUrl);
    expect(getPrDetails).toHaveBeenCalledWith(mockUrlParts);
    expect(getPrFiles).toHaveBeenCalledWith(mockUrlParts);
    expect(getPrDiff).toHaveBeenCalledWith(mockUrlParts);
  });
});
