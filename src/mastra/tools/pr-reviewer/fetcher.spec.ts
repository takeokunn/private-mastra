import { Octokit } from "@octokit/rest";
import { describe, expect, it, vi } from "vitest";

import { getPrDetails, getPrDiff, getPrFiles } from "./fetcher";
import type { PrUrlParts } from "./types";

// Mock Octokit
// We only need to mock the methods we use: pulls.get and pulls.listFiles
const mockOctokit = {
  pulls: {
    get: vi.fn(),
    listFiles: vi.fn(),
  },
} as unknown as Octokit; // Type assertion for simplicity

const mockParts: PrUrlParts = {
  owner: "test-owner",
  repo: "test-repo",
  pull_number: 123,
};

describe("PR Fetcher", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getPrDetails", () => {
    it("should fetch and return PR details successfully", async () => {
      const mockResponse = {
        data: {
          title: "Test PR Title",
          body: "Test PR body.",
          html_url: "https://github.com/test-owner/test-repo/pull/123",
          base: { sha: "base-sha-123" },
          head: { sha: "head-sha-456" },
          // other fields omitted for brevity
        },
      };
      mockOctokit.pulls.get.mockResolvedValue(mockResponse);

      const result = await getPrDetails(mockOctokit, mockParts);

      expect(mockOctokit.pulls.get).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        pull_number: 123,
      });
      expect(result).toEqual({
        owner: "test-owner",
        repo: "test-repo",
        pull_number: 123,
        title: "Test PR Title",
        body: "Test PR body.",
        html_url: "https://github.com/test-owner/test-repo/pull/123",
        base_sha: "base-sha-123",
        head_sha: "head-sha-456",
      });
    });

    it("should throw a specific error if fetching details fails", async () => {
      const apiError = new Error("API Error");
      mockOctokit.pulls.get.mockRejectedValue(apiError);

      await expect(getPrDetails(mockOctokit, mockParts)).rejects.toThrow(
        "[GitHubApiError] Failed to fetch PR details for test-owner/test-repo#123",
      );
      expect(mockOctokit.pulls.get).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        pull_number: 123,
      });
    });
  });

  describe("getPrFiles", () => {
    it("should fetch and return PR files successfully", async () => {
      const mockResponse = {
        data: [
          {
            filename: "src/file1.ts",
            status: "modified",
            changes: 10,
            additions: 8,
            deletions: 2,
          },
          {
            filename: "test/file1.spec.ts",
            status: "added",
            changes: 20,
            additions: 20,
            deletions: 0,
          },
        ],
      };
      mockOctokit.pulls.listFiles.mockResolvedValue(mockResponse);

      const result = await getPrFiles(mockOctokit, mockParts);

      expect(mockOctokit.pulls.listFiles).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        pull_number: 123,
      });
      expect(result).toEqual([
        {
          filename: "src/file1.ts",
          status: "modified",
          changes: 10,
          additions: 8,
          deletions: 2,
        },
        {
          filename: "test/file1.spec.ts",
          status: "added",
          changes: 20,
          additions: 20,
          deletions: 0,
        },
      ]);
    });

    it("should throw a specific error if fetching files fails", async () => {
      const apiError = new Error("API Error");
      mockOctokit.pulls.listFiles.mockRejectedValue(apiError);

      await expect(getPrFiles(mockOctokit, mockParts)).rejects.toThrow(
        "[GitHubApiError] Failed to fetch PR files for test-owner/test-repo#123",
      );
      expect(mockOctokit.pulls.listFiles).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        pull_number: 123,
      });
    });
  });

  describe("getPrDiff", () => {
    it("should fetch and return PR diff successfully", async () => {
      const mockDiff = `diff --git a/file.txt b/file.txt
index e69de29..b5a7f7f 100644
--- a/file.txt
+++ b/file.txt
@@ -0,0 +1 @@
+Hello World
`;
      // Mock the response for the diff format
      // Note: The actual Octokit response structure might differ slightly,
      // but the key is that the `data` property holds the diff string
      // when the mediaType format is 'diff'.
      mockOctokit.pulls.get.mockResolvedValue({ data: mockDiff });

      const result = await getPrDiff(mockOctokit, mockParts);

      expect(mockOctokit.pulls.get).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        pull_number: 123,
        mediaType: {
          format: "diff",
        },
      });
      expect(result).toBe(mockDiff);
    });

    it("should throw a specific error if fetching diff fails", async () => {
      const apiError = new Error("API Error");
      mockOctokit.pulls.get.mockRejectedValue(apiError);

      await expect(getPrDiff(mockOctokit, mockParts)).rejects.toThrow(
        "[GitHubApiError] Failed to fetch PR diff for test-owner/test-repo#123",
      );
      expect(mockOctokit.pulls.get).toHaveBeenCalledWith({
        owner: "test-owner",
        repo: "test-repo",
        pull_number: 123,
        mediaType: {
          format: "diff",
        },
      });
    });
  });
});
