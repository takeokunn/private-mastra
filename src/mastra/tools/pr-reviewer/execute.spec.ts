import type { ToolExecutionContext } from "@mastra/core";
import { Octokit } from "@octokit/rest";
import { Result } from "neverthrow";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { executePrReview } from "./execute";
import * as fetcher from "./fetcher";
import * as output from "./output";
import * as parser from "./parse";
import type { PrDetails, PrFileInfo, PrUrlParts } from "./types";

// Mock dependencies
vi.mock("@octokit/rest");
vi.mock("./parse");
vi.mock("./fetcher");
vi.mock("./output");

// Mock context if needed, or provide a minimal version
const mockContext = {} as ToolExecutionContext;

const mockPrUrl = "https://github.com/test-owner/test-repo/pull/123";
const mockParts: PrUrlParts = {
  owner: "test-owner",
  repo: "test-repo",
  pull_number: 123,
};
const mockDetails: PrDetails = {
  owner: "test-owner",
  repo: "test-repo",
  pull_number: 123,
  title: "Test PR",
  body: "Test body",
  html_url: mockPrUrl,
  base_sha: "base1",
  head_sha: "head1",
};
const mockFiles: PrFileInfo[] = [{ filename: "file.ts", status: "modified", changes: 1, additions: 1, deletions: 0 }];
const mockDiff = "diff --git a/file.ts b/file.ts";
const mockReportContent = "#+TITLE: Test Report";
const mockReportPath = "/path/to/report.org";

describe("executePrReview", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = { ...process.env };
    // Set required environment variable for tests
    process.env.GITHUB_TOKEN = "test-token";

    // Reset mocks before each test
    vi.resetAllMocks();

    // Mock successful dependency calls by default
    vi.mocked(parser.parsePrUrl).mockReturnValue(mockParts);
    vi.mocked(fetcher.getPrDetails).mockResolvedValue(mockDetails);
    vi.mocked(fetcher.getPrFiles).mockResolvedValue(mockFiles);
    vi.mocked(fetcher.getPrDiff).mockResolvedValue(mockDiff);
    vi.mocked(output.generateOrgReport).mockReturnValue(mockReportContent);
    vi.mocked(output.writeReportToFile).mockResolvedValue(mockReportPath);
    // Mock Octokit constructor if needed, though often mocking the instance methods is sufficient
    // vi.mocked(Octokit).mockImplementation(() => ({ /* mock methods */ } as any));
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it("should successfully execute the review and return the report path", async () => {
    const result = await executePrReview(mockPrUrl, mockContext);

    expect(parser.parsePrUrl).toHaveBeenCalledWith(mockPrUrl);
    expect(Octokit).toHaveBeenCalledWith({ auth: "test-token" });
    // Get the mocked Octokit instance (assuming the constructor mock works or isn't strictly needed if method mocks are sufficient)
    // const octokitInstance = vi.mocked(Octokit).mock.results[0]?.value;
    // For simplicity, we check if the fetcher functions were called (they implicitly use the Octokit instance)
    expect(fetcher.getPrDetails).toHaveBeenCalledWith(expect.any(Octokit), mockParts);
    expect(fetcher.getPrFiles).toHaveBeenCalledWith(expect.any(Octokit), mockParts);
    expect(fetcher.getPrDiff).toHaveBeenCalledWith(expect.any(Octokit), mockParts);
    expect(output.generateOrgReport).toHaveBeenCalledWith(mockDetails, mockFiles, mockDiff);
    expect(output.writeReportToFile).toHaveBeenCalledWith(mockReportContent);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({ reportPath: mockReportPath });
  });

  it("should return an error if GITHUB_TOKEN is missing", async () => {
    delete process.env.GITHUB_TOKEN; // Unset the token

    const result = await executePrReview(mockPrUrl, mockContext);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toContain(
      "GITHUB_TOKEN environment variable is not set",
    );
    expect(parser.parsePrUrl).not.toHaveBeenCalled(); // Should fail before parsing
  });

  it("should return an error if parsePrUrl throws", async () => {
    const parseError = new Error("[InvalidUrl] Invalid URL");
    vi.mocked(parser.parsePrUrl).mockImplementation(() => {
      throw parseError;
    });

    const result = await executePrReview(mockPrUrl, mockContext);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe(parseError); // Propagate the original error
    expect(fetcher.getPrDetails).not.toHaveBeenCalled();
  });

  it("should return an error if getPrDetails fails", async () => {
    const fetchDetailsError = new Error("[GitHubApiError] Failed to fetch details");
    vi.mocked(fetcher.getPrDetails).mockRejectedValue(fetchDetailsError);

    const result = await executePrReview(mockPrUrl, mockContext);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe(fetchDetailsError);
    expect(fetcher.getPrFiles).not.toHaveBeenCalled(); // Should fail before fetching files
  });

  it("should return an error if getPrFiles fails", async () => {
    const fetchFilesError = new Error("[GitHubApiError] Failed to fetch files");
    vi.mocked(fetcher.getPrFiles).mockRejectedValue(fetchFilesError);

    const result = await executePrReview(mockPrUrl, mockContext);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe(fetchFilesError);
    expect(fetcher.getPrDiff).not.toHaveBeenCalled(); // Should fail before fetching diff
  });

  it("should return an error if getPrDiff fails", async () => {
    const fetchDiffError = new Error("[GitHubApiError] Failed to fetch diff");
    vi.mocked(fetcher.getPrDiff).mockRejectedValue(fetchDiffError);

    const result = await executePrReview(mockPrUrl, mockContext);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe(fetchDiffError);
    expect(output.generateOrgReport).not.toHaveBeenCalled(); // Should fail before generating report
  });

  it("should return an error if writeReportToFile fails", async () => {
    const writeError = new Error("Failed to write file");
    vi.mocked(output.writeReportToFile).mockRejectedValue(writeError);

    const result = await executePrReview(mockPrUrl, mockContext);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe(writeError);
  });
});
