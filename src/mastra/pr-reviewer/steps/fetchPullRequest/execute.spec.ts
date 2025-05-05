import { describe, it, expect, vi, beforeEach } from "vitest";
import { execute } from "./execute";
import type { WorkflowContext } from "@mastra/core";
import type { PullRequestUrlParts, PullRequestDetails, PullRequestFileInfo } from "@src/mastra/pr-reviewer/types";

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
  parsePullRequestUrl: vi.fn(() => mockParts),
}));

vi.mock("./utils/fetcher", async () => ({
  getPullRequestDetails: vi.fn(() => mockDetails),
  getPullRequestFiles: vi.fn(() => mockFiles),
  getPullRequestDiff: vi.fn(() => mockDiff),
}));

describe("execute", () => {
  const mockContext: WorkflowContext = {
    triggerData: {
      inputSchema: {
        url: "https://github.com/test-owner/test-repo/pull/123",
      },
    },
  } as unknown as WorkflowContext;

  beforeEach(() => {
    process.env.GITHUB_TOKEN = "fake-token";
  })

  it("fetches all PR info and returns it", async () => {
    process.env.GITHUB_TOKEN = "fake-token";

    const result = await execute(mockContext);

    expect(result).toEqual({
      parts: mockParts,
      details: mockDetails,
      files: mockFiles,
      diff: mockDiff,
    });
  });

  it("throws an error if GITHUB_TOKEN is not set", async () => {
    delete process.env.GITHUB_TOKEN;

    await expect(() => execute(mockContext))
      .rejects
      .toThrow("[MissingToken] 環境変数 GITHUB_TOKEN が設定されていません。");
  });
});
