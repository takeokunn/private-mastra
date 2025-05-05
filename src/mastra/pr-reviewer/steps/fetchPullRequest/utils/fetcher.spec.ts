import { Octokit } from "@octokit/rest";
import { describe, expect, it, Mock, vi } from "vitest";

import { getPullRequestDetails, getPullRequestFiles, getPullRequestDiff } from "./fetcher";
import type { PullRequestDetails, PullRequestUrlParts } from "@src/mastra/pr-reviewer/types";

const mockOctokit = {
  pulls: {
    get: vi.fn(),
    listFiles: vi.fn(),
  },
} as unknown as Octokit;

const mockParts: PullRequestUrlParts = {
  owner: "test-owner",
  repo: "test-repo",
  pull_number: 123,
};

describe("getPullRequestDetails", () => {
  const expectedArgs = {
    owner: "test-owner",
    repo: "test-repo",
    pull_number: 123,
  };

  const mockApiResponse = {
    data: {
      title: "Test PR Title",
      body: "Test PR body.",
      html_url: "https://github.com/test-owner/test-repo/pull/123",
      base: { sha: "base-sha-123" },
      head: { sha: "head-sha-456" },
    },
  };

  const expectedResult: PullRequestDetails = {
    owner: "test-owner",
    repo: "test-repo",
    pull_number: 123,
    title: "Test PR Title",
    body: "Test PR body.",
    html_url: "https://github.com/test-owner/test-repo/pull/123",
    base_sha: "base-sha-123",
    head_sha: "head-sha-456",
  };

  it("fetches PR details and returns expected structure", async () => {
    (mockOctokit.pulls.get as unknown as Mock).mockResolvedValue(mockApiResponse);

    const result = await getPullRequestDetails(mockOctokit, mockParts);

    expect(mockOctokit.pulls.get).toHaveBeenCalledWith(expectedArgs);
    expect(result).toEqual(expectedResult);
  });

  it("throws a formatted error if fetching PR details fails", async () => {
    const apiError = new Error("API Error");
    (mockOctokit.pulls.get as unknown as Mock).mockRejectedValue(apiError);

    await expect(() => getPullRequestDetails(mockOctokit, mockParts)).rejects.toThrow(
      "[GitHubApiError] Failed to fetch PR details for test-owner/test-repo#123",
    );

    expect(mockOctokit.pulls.get).toHaveBeenCalledWith(expectedArgs);
  });
});

describe("getPullRequestFiles", () => {
  const expectedArgs = {
    owner: "test-owner",
    repo: "test-repo",
    pull_number: 123,
  };

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

  const expectedFileResult = [
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
  ];

  it("fetches files changed in the PR and returns expected list", async () => {
    (mockOctokit.pulls.listFiles as unknown as Mock).mockResolvedValue(mockResponse);

    const files = await getPullRequestFiles(mockOctokit, mockParts);

    expect(mockOctokit.pulls.listFiles).toHaveBeenCalledWith(expectedArgs);
    expect(files).toEqual(expectedFileResult);
  });

  it("throws a formatted error if file fetching fails", async () => {
    const apiError = new Error("Fetch failed");
    (mockOctokit.pulls.listFiles as unknown as Mock).mockRejectedValue(apiError);

    await expect(() => getPullRequestFiles(mockOctokit, mockParts)).rejects.toThrow(
      "[GitHubApiError] Failed to fetch PR files for test-owner/test-repo#123",
    );

    expect(mockOctokit.pulls.listFiles).toHaveBeenCalledWith(expectedArgs);
  });
});

describe("getPullRequestDiff", () => {
  const expectedArgs = {
    owner: "test-owner",
    repo: "test-repo",
    pull_number: 123,
  };

  const mockDiff = `diff --git a/file.txt b/file.txt
index e69de29..b5a7f7f 100644
--- a/file.txt
+++ b/file.txt
@@ -0,0 +1 @@
+Hello World
`;

  it("fetches the diff of the PR in GitHub diff format", async () => {
    (mockOctokit.pulls.get as unknown as Mock).mockResolvedValue({ data: mockDiff });

    const result = await getPullRequestDiff(mockOctokit, mockParts);

    expect(mockOctokit.pulls.get).toHaveBeenCalledWith(expectedArgs);
    expect(result).toBe(mockDiff);
  });

  it("throws a formatted error if diff fetching fails", async () => {
    const apiError = new Error("Something went wrong");
    (mockOctokit.pulls.get as unknown as Mock).mockRejectedValue(apiError);

    await expect(() => getPullRequestDiff(mockOctokit, mockParts)).rejects.toThrow(
      "[GitHubApiError] Failed to fetch PR diff for test-owner/test-repo#123",
    );

    expect(mockOctokit.pulls.get).toHaveBeenCalledWith(expectedArgs);
  });
});
