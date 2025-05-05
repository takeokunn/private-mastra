import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execute } from "./execute";
import type { WorkflowContext } from "@mastra/core";
import type { PullRequestUrlParts, PullRequestDetails, PullRequestFileInfo } from "@src/mastra/pr-reviewer/types";
import { parsePullRequestUrl } from "./utils/parse";
import { getPullRequestDetails, getPullRequestFiles, getPullRequestDiff } from "./utils/fetcher";

const mockParts: PullRequestUrlParts = {
  owner: "test-owner",
  repo: "test-repo",
  pull_number: 123,
};

const mockDetails: PullRequestDetails = {
  owner: 'test-owner',
  repo: 'test-repo',
  pull_number: 123,
  title: "Fix bug",
  body: "This fixes a bug",
  html_url: "https://github.com/test-owner/test-repo/pull/123",
  base_sha: "base-sha",
  head_sha: "head-sha"
};

const mockFiles: PullRequestFileInfo[] = [
  {
    filename: "test/file1.spec.ts",
    status: "added",
    changes: 20,
    additions: 20,
    deletions: 0,
  },
];

const mockDiff = "diff --git a/src/index.ts b/src/index.ts";

vi.mock("./utils/parse", () => ({
  parsePullRequestUrl: vi.fn(),
}));

vi.mock("./utils/fetcher", async () => ({
  getPullRequestDetails: vi.fn(),
  getPullRequestFiles: vi.fn(),
  getPullRequestDiff: vi.fn(),
}));

// モックされた関数を型安全に扱うためのキャスト
const mockedParsePullRequestUrl = vi.mocked(parsePullRequestUrl);
const mockedGetPullRequestDetails = vi.mocked(getPullRequestDetails);
const mockedGetPullRequestFiles = vi.mocked(getPullRequestFiles);
const mockedGetPullRequestDiff = vi.mocked(getPullRequestDiff);

describe("execute", () => {
  const mockContext: WorkflowContext = {
    triggerData: {
      inputSchema: {
        url: "https://github.com/test-owner/test-repo/pull/123",
      },
    },
  } as unknown as WorkflowContext;

  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules(); // モジュールキャッシュをリセット
    process.env = { ...originalEnv, GITHUB_TOKEN: "fake-token" }; // 環境変数を設定

    // 各テスト前にデフォルトの成功モックを設定
    mockedParsePullRequestUrl.mockReturnValue(mockParts);
    mockedGetPullRequestDetails.mockResolvedValue(mockDetails);
    mockedGetPullRequestFiles.mockResolvedValue(mockFiles);
    mockedGetPullRequestDiff.mockResolvedValue(mockDiff);
  });

  afterEach(() => {
    process.env = originalEnv; // 環境変数を元に戻す
    vi.clearAllMocks(); // すべてのモックをクリア
  });


  it("fetches all PR info and returns it", async () => {
    const result = await execute(mockContext);

    expect(mockedParsePullRequestUrl).toHaveBeenCalledWith(mockContext.triggerData.inputSchema.url);
    expect(mockedGetPullRequestDetails).toHaveBeenCalledWith(mockParts, "fake-token");
    expect(mockedGetPullRequestFiles).toHaveBeenCalledWith(mockParts, "fake-token");
    expect(mockedGetPullRequestDiff).toHaveBeenCalledWith(mockParts, "fake-token");
    expect(result).toEqual({
      parts: mockParts,
      details: mockDetails,
      files: mockFiles,
      diff: mockDiff,
    });
  });

  it("throws an error if GITHUB_TOKEN is not set", async () => {
    delete process.env.GITHUB_TOKEN; // GITHUB_TOKEN を削除

    await expect(execute(mockContext))
      .rejects
      .toThrow("[MissingToken] 環境変数 GITHUB_TOKEN が設定されていません。");
  });

  it("throws an error if parsePullRequestUrl fails", async () => {
    const parseError = new Error("Failed to parse URL");
    mockedParsePullRequestUrl.mockImplementation(() => {
      throw parseError;
    });

    await expect(execute(mockContext)).rejects.toThrow(parseError);
  });

  it("throws an error if getPullRequestDetails fails", async () => {
    const fetchDetailsError = new Error("Failed to fetch details");
    mockedGetPullRequestDetails.mockRejectedValue(fetchDetailsError);

    await expect(execute(mockContext)).rejects.toThrow(fetchDetailsError);
  });

  it("throws an error if getPullRequestFiles fails", async () => {
    const fetchFilesError = new Error("Failed to fetch files");
    mockedGetPullRequestFiles.mockRejectedValue(fetchFilesError);

    await expect(execute(mockContext)).rejects.toThrow(fetchFilesError);
  });

  it("throws an error if getPullRequestDiff fails", async () => {
    const fetchDiffError = new Error("Failed to fetch diff");
    mockedGetPullRequestDiff.mockRejectedValue(fetchDiffError);

    await expect(execute(mockContext)).rejects.toThrow(fetchDiffError);
  });
});
