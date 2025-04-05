import { Octokit } from "@octokit/rest";
import fs from "fs/promises";
// import { Result, err, ok } from "neverthrow"; // Removed neverthrow
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { prReviewerTool } from "./pr-reviewer"; // Adjust import path if needed

// --- Mocks ---
// Mock Octokit completely
vi.mock("@octokit/rest", () => {
  const mockPulls = {
    get: vi.fn(),
    listFiles: vi.fn(),
  };
  return {
    Octokit: vi.fn(() => ({
      pulls: mockPulls,
    })),
    // Expose mocks for manipulation in tests
    mockPulls,
  };
});

// Mock fs/promises
vi.mock("fs/promises", async (importOriginal) => {
  const actualFs = await importOriginal<typeof fs>();
  return {
    ...actualFs, // Use actual implementations for non-mocked functions if needed
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  };
});

// --- Test Suite ---
describe("prReviewerTool", () => {
  // Get typed access to the mocks
  const { mockPulls } = await import("@octokit/rest");
  const mockFs = await import("fs/promises");

  const validPrUrl = "https://github.com/test-owner/test-repo/pull/123";
  const invalidPrUrl = "invalid-url";
  const projectRoot = process.cwd();
  const expectedOutputDir = path.join(projectRoot, ".claude/output");

  // Mock data
  const mockPrDetails = {
    data: {
      title: "Test PR",
      body: "Test Body",
      html_url: validPrUrl,
      base: { sha: "base123" },
      head: { sha: "head456" },
      number: 123, // Added number for consistency
      // Add other fields if needed by generateOrgReport
    },
  };
  const mockPrFiles = {
    data: [
      { filename: "file1.ts", status: "modified", changes: 10, additions: 5, deletions: 5 },
      { filename: "file2.ts", status: "added", changes: 20, additions: 20, deletions: 0 },
    ],
  };
  const mockPrDiff = {
    // Octokit returns the diff string directly in data when mediaType is 'diff'
    data: "diff --git a/file1.ts b/file1.ts\n--- a/file1.ts\n+++ b/file1.ts\n@@ -1,1 +1,1 @@\n-old line\n+new line",
  };

  beforeEach(() => {
    // Set default successful mock implementations
    mockPulls.get.mockResolvedValue(mockPrDetails); // For details
    mockPulls.get.mockResolvedValueOnce(mockPrDetails); // For details fetch
    mockPulls.get.mockResolvedValueOnce(mockPrDiff); // For diff fetch
    mockPulls.listFiles.mockResolvedValue(mockPrFiles);
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);
    // Set GITHUB_TOKEN
    process.env.GITHUB_TOKEN = "test-token";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.GITHUB_TOKEN;
  });

  it("should have correct id, description, and schemas", () => {
    expect(prReviewerTool.id).toBe("pr-reviewer");
    expect(prReviewerTool.description).toBe(
      "Fetches GitHub Pull Request information (details, files, diff) and generates a basic Org Mode review report.",
    );
    expect(prReviewerTool.inputSchema).toBeInstanceOf(z.ZodObject);
    expect(prReviewerTool.outputSchema).toBeInstanceOf(z.ZodObject);
    // Optionally, test specific schema fields
    expect(prReviewerTool.inputSchema.shape.prUrl).toBeDefined();
    expect(prReviewerTool.outputSchema.shape.reportPath).toBeDefined();
  });

  it("should successfully execute with a valid PR URL", async () => {
    // Mock successful execution
    mockPulls.get.mockResolvedValueOnce(mockPrDetails); // For details fetch
    mockPulls.listFiles.mockResolvedValue(mockPrFiles); // For files fetch
    mockPulls.get.mockResolvedValueOnce(mockPrDiff); // For diff fetch (second get call)
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);

    const result = await prReviewerTool.execute({ context: { prUrl: validPrUrl } });

    // Check Octokit calls
    expect(Octokit).toHaveBeenCalledWith({ auth: "test-token" });
    // Verify the order and parameters of Octokit calls
    expect(mockPulls.get).toHaveBeenNthCalledWith(1, { // First call for details
      owner: "test-owner",
      repo: "test-repo",
      pull_number: 123,
    });
    expect(mockPulls.listFiles).toHaveBeenCalledWith({ // Call for files
      owner: "test-owner",
      repo: "test-repo",
      pull_number: 123,
    });
    expect(mockPulls.get).toHaveBeenNthCalledWith(2, { // Second call for diff
      owner: "test-owner",
      repo: "test-repo",
      pull_number: 123,
      mediaType: { format: "diff" },
    });

    // Check file system calls
    expect(mockFs.mkdir).toHaveBeenCalledWith(expectedOutputDir, { recursive: true });
    expect(mockFs.writeFile).toHaveBeenCalledOnce();
    const writtenPath = (mockFs.writeFile.mock.calls[0][0] as string);
    const writtenContent = mockFs.writeFile.mock.calls[0][1] as string;
    expect(writtenPath).toMatch(new RegExp(`${expectedOutputDir.replace(/\\/g, "\\\\")}/\\d{14}_pull_request\\.org`)); // Check filename pattern
    expect(writtenContent).toContain("#+TITLE: Pull Request Review: Test PR");
    expect(writtenContent).toContain("- file1.ts (modified, +5/-5)");
    expect(writtenContent).toContain("- file2.ts (added, +20/-0)");
    expect(writtenContent).toContain("diff --git a/file1.ts");

    // Check result
    expect(result).toHaveProperty("reportPath");
    expect(result.reportPath).toBe(writtenPath); // Should return the path it wrote to
  });

  it("should throw an error if GITHUB_TOKEN is not set", async () => {
    delete process.env.GITHUB_TOKEN;
    await expect(prReviewerTool.execute({ context: { prUrl: validPrUrl } })).rejects.toThrow(
      "[MissingToken] 環境変数 GITHUB_TOKEN が設定されていません。", // Match the new error message
    );
  });

  it("should throw an error for an invalid PR URL", async () => {
    await expect(prReviewerTool.execute({ context: { prUrl: invalidPrUrl } })).rejects.toThrow(
      "[InvalidUrl] 不正な PR URL フォーマットです。", // Match the new error message prefix
    );
  });

  it("should throw an error if fetching PR details fails", async () => {
    const apiError = new Error("API Error: Not Found");
    mockPulls.get.mockRejectedValueOnce(apiError); // Fail the first get call (details)

    await expect(prReviewerTool.execute({ context: { prUrl: validPrUrl } })).rejects.toThrow(
      "[GitHubApiError] Failed to fetch PR details for test-owner/test-repo#123", // Match the new error message
    );
  });

  it("should throw an error if fetching PR files fails", async () => {
    const apiError = new Error("API Error: Server Error");
    // Mock successful details fetch first
    mockPulls.get.mockResolvedValueOnce(mockPrDetails);
    mockPulls.listFiles.mockRejectedValue(apiError); // Fail listFiles call

    await expect(prReviewerTool.execute({ context: { prUrl: validPrUrl } })).rejects.toThrow(
      "[GitHubApiError] Failed to fetch PR files for test-owner/test-repo#123", // Match the new error message
    );
  });

  it("should throw an error if fetching PR diff fails", async () => {
    const apiError = new Error("API Error: Forbidden");
    // Mock successful details and files, but fail diff (second get call)
    mockPulls.get.mockResolvedValueOnce(mockPrDetails); // Success for details
    mockPulls.listFiles.mockResolvedValue(mockPrFiles); // Success for files
    mockPulls.get.mockRejectedValueOnce(apiError); // Fail for diff

    await expect(prReviewerTool.execute({ context: { prUrl: validPrUrl } })).rejects.toThrow(
      "[GitHubApiError] Failed to fetch PR diff for test-owner/test-repo#123", // Match the new error message
    );
  });


  it("should throw an error if writing the report file fails", async () => {
    const writeError = new Error("Disk full");
    // Mock successful API calls
    mockPulls.get.mockResolvedValueOnce(mockPrDetails);
    mockPulls.listFiles.mockResolvedValue(mockPrFiles);
    mockPulls.get.mockResolvedValueOnce(mockPrDiff);
    mockFs.mkdir.mockResolvedValue(undefined); // Assume mkdir succeeds
    mockFs.writeFile.mockRejectedValue(writeError); // Fail writeFile

    await expect(prReviewerTool.execute({ context: { prUrl: validPrUrl } })).rejects.toThrow(
      "[FileWriteError] レポートファイルの書き込みに失敗しました", // Match the new error message prefix
    );
  });
});
