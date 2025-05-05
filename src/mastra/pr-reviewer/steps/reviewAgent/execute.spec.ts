import { describe, it, expect, vi } from "vitest";
import { execute } from "./execute";
import * as agents from "./agents"; // Import all exports from agents
import type { PullRequest, ReviewType } from "@src/mastra/pr-reviewer/types";

// Mock the agents module
const mockSummaryAgentExecute = vi.fn();
const mockArchitectureAgentExecute = vi.fn();
// Add mocks for other agents if needed for more comprehensive tests

vi.mock("./agents", async (importOriginal) => {
  const original = await importOriginal<typeof agents>();
  return {
    ...original, // Keep other exports if any
    agents: {
      summary: { execute: mockSummaryAgentExecute },
      architecture: { execute: mockArchitectureAgentExecute },
      // Mock other agents as needed
      code_quality: { execute: vi.fn() },
      performance: { execute: vi.fn() },
      security: { execute: vi.fn() },
      testing: { execute: vi.fn() },
    },
  };
});

describe("reviewAgent execute", () => {
  const mockContext: PullRequest = {
    // Provide minimal mock data required by the agent's execute method
    parts: { owner: "test", repo: "test", pull_number: 1 },
    details: {
      owner: "test",
      repo: "test",
      pull_number: 1,
      title: "Test PR",
      body: "Test body",
      html_url: "http://example.com/pr/1",
      base_sha: "base1",
      head_sha: "head1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      merged_at: null,
      closed_at: null,
      state: "open",
      user: { login: "user" },
      assignees: [],
      requested_reviewers: [],
      labels: [],
      draft: false,
      commits: 1,
      additions: 10,
      deletions: 2,
      changed_files: 1,
    },
    files: [],
    diff: "diff --git a/file.txt b/file.txt\n--- a/file.txt\n+++ b/file.txt\n@@ -1 +1 @@\n-hello\n+world",
  };

  it("should call the correct agent execute method based on reviewType", async () => {
    const reviewType: ReviewType = "summary";
    const expectedResult = { review: "This is the summary review." };
    mockSummaryAgentExecute.mockResolvedValue(expectedResult);

    const result = await execute(reviewType)({ context: mockContext });

    // Verify that the correct agent's execute was called with the context
    expect(mockSummaryAgentExecute).toHaveBeenCalledWith({ context: mockContext });
    // Verify that other agents were not called
    expect(mockArchitectureAgentExecute).not.toHaveBeenCalled();
    // Verify the result is returned correctly
    expect(result).toEqual(expectedResult);
  });

  it("should throw an error for an unknown reviewType", async () => {
    const reviewType = "unknown_type" as ReviewType; // Force unknown type

    // Expect execute(reviewType) to throw when called
    // Note: The current implementation might not explicitly throw for unknown types,
    // it might result in a runtime error like "Cannot read properties of undefined".
    // Adjust the expectation based on the actual behavior or add error handling.
    await expect(execute(reviewType)({ context: mockContext })).rejects.toThrow();
    // Or, if it throws a specific error:
    // await expect(execute(reviewType)({ context: mockContext })).rejects.toThrow(/Unknown review type/);

    // Ensure no agent was called
    expect(mockSummaryAgentExecute).not.toHaveBeenCalled();
    expect(mockArchitectureAgentExecute).not.toHaveBeenCalled();
  });
});
