import { describe, expect, it } from "vitest";
import {
  fetchPullRequestOutputSchema,
  generateOutputSchema,
  reviewAgentOutputSchema,
  workflowInputSchema,
} from "./schema";

describe("PR Reviewer Schemas", () => {
  describe("workflowInputSchema", () => {
    it("should validate a correct GitHub PR URL", () => {
      const validInput = { url: "https://github.com/owner/repo/pull/123" };
      const result = workflowInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should invalidate an incorrect URL", () => {
      const invalidInput = { url: "not-a-url" };
      const result = workflowInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should invalidate a non-string URL", () => {
      const invalidInput = { url: 123 };
      const result = workflowInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should invalidate input without a url field", () => {
      const invalidInput = {};
      const result = workflowInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("fetchPullRequestOutputSchema", () => {
    it("should validate correct fetch pull request output", () => {
      const validInput = {
        parts: {
          owner: "test-owner",
          repo: "test-repo",
          pull_number: 1,
        },
        details: {
          owner: "test-owner",
          repo: "test-repo",
          pull_number: 1,
          title: "Test PR",
          body: "Test body",
          html_url: "https://github.com/test-owner/test-repo/pull/1",
          base_sha: "base123",
          head_sha: "head456",
        },
        files: [
          {
            filename: "src/index.ts",
            status: "modified",
            changes: 10,
            additions: 8,
            deletions: 2,
          },
        ],
        diff: "@@ -1,1 +1,1 @@\n-hello\n+world",
      };
      const result = fetchPullRequestOutputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

     it("should validate correct fetch pull request output with null body", () => {
      const validInput = {
        parts: {
          owner: "test-owner",
          repo: "test-repo",
          pull_number: 1,
        },
        details: {
          owner: "test-owner",
          repo: "test-repo",
          pull_number: 1,
          title: "Test PR",
          body: null, // Null body
          html_url: "https://github.com/test-owner/test-repo/pull/1",
          base_sha: "base123",
          head_sha: "head456",
        },
        files: [],
        diff: "",
      };
      const result = fetchPullRequestOutputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should invalidate if parts are missing", () => {
      const invalidInput = {
        // parts missing
        details: {
          owner: "test-owner",
          repo: "test-repo",
          pull_number: 1,
          title: "Test PR",
          body: "Test body",
          html_url: "https://github.com/test-owner/test-repo/pull/1",
          base_sha: "base123",
          head_sha: "head456",
        },
        files: [],
        diff: "",
      };
      const result = fetchPullRequestOutputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should invalidate if details are missing", () => {
        const invalidInput = {
            parts: {
                owner: "test-owner",
                repo: "test-repo",
                pull_number: 1,
            },
            // details missing
            files: [],
            diff: "",
        };
        const result = fetchPullRequestOutputSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
    });


    it("should invalidate if files array has wrong item type", () => {
      const invalidInput = {
        parts: { owner: "o", repo: "r", pull_number: 1 },
        details: { owner: "o", repo: "r", pull_number: 1, title: "t", body: null, html_url: "url", base_sha: "b", head_sha: "h" },
        files: [{ filename: "f", status: "s", changes: "not-a-number", additions: 1, deletions: 1 }], // changes is wrong type
        diff: "d",
      };
      const result = fetchPullRequestOutputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

     it("should invalidate if diff is not a string", () => {
      const invalidInput = {
        parts: { owner: "o", repo: "r", pull_number: 1 },
        details: { owner: "o", repo: "r", pull_number: 1, title: "t", body: null, html_url: "url", base_sha: "b", head_sha: "h" },
        files: [],
        diff: 123, // diff is wrong type
      };
      const result = fetchPullRequestOutputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("reviewAgentOutputSchema", () => {
    it("should validate correct review agent output", () => {
      const validInput = { review: "This looks good." };
      const result = reviewAgentOutputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should invalidate if review is missing", () => {
      const invalidInput = {};
      const result = reviewAgentOutputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should invalidate if review is not a string", () => {
      const invalidInput = { review: 123 };
      const result = reviewAgentOutputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("generateOutputSchema", () => {
    it("should validate correct generate output", () => {
      const validInput = { path: "/path/to/report.md" };
      const result = generateOutputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should invalidate if path is missing", () => {
      const invalidInput = {};
      const result = generateOutputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should invalidate if path is not a string", () => {
      const invalidInput = { path: 123 };
      const result = generateOutputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});
