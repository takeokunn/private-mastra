import { describe, expect, it } from "vitest";
import {
  fetchPullRequestOutputSchema,
  generateOutputSchema,
  reviewAgentOutputSchema,
  workflowInputSchema,
} from "./schema";

describe("workflowInputSchema", () => {
  it.each([
    ["validates a correct GitHub PR URL", { url: "https://github.com/owner/repo/pull/123" }, true],
    ["invalidates an incorrect URL", { url: "not-a-url" }, false],
    ["invalidates a non-string URL", { url: 123 }, false],
    ["invalidates input without a url field", {}, false],
  ])("%s", (_description, input, expected) => {
    const result = workflowInputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe("fetchPullRequestOutputSchema", () => {
  const cases = [
    {
      name: "valid fetch pull request output",
      input: {
        parts: { owner: "test-owner", repo: "test-repo", pull_number: 1 },
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
      },
      expected: true,
    },
    {
      name: "valid fetch pull request output with null body",
      input: {
        parts: { owner: "test-owner", repo: "test-repo", pull_number: 1 },
        details: {
          owner: "test-owner",
          repo: "test-repo",
          pull_number: 1,
          title: "Test PR",
          body: null,
          html_url: "https://github.com/test-owner/test-repo/pull/1",
          base_sha: "base123",
          head_sha: "head456",
        },
        files: [],
        diff: "",
      },
      expected: true,
    },
    {
      name: "invalid if parts are missing",
      input: {
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
      },
      expected: false,
    },
    {
      name: "invalid if details are missing",
      input: {
        parts: { owner: "test-owner", repo: "test-repo", pull_number: 1 },
        // details missing
        files: [],
        diff: "",
      },
      expected: false,
    },
    {
      name: "invalid if files array has wrong item type",
      input: {
        parts: { owner: "o", repo: "r", pull_number: 1 },
        details: {
          owner: "o",
          repo: "r",
          pull_number: 1,
          title: "t",
          body: null,
          html_url: "url",
          base_sha: "b",
          head_sha: "h",
        },
        files: [
          {
            filename: "f",
            status: "s",
            changes: "not-a-number", // wrong type
            additions: 1,
            deletions: 1,
          },
        ],
        diff: "d",
      },
      expected: false,
    },
    {
      name: "invalid if diff is not a string",
      input: {
        parts: { owner: "o", repo: "r", pull_number: 1 },
        details: {
          owner: "o",
          repo: "r",
          pull_number: 1,
          title: "t",
          body: null,
          html_url: "url",
          base_sha: "b",
          head_sha: "h",
        },
        files: [],
        diff: 123, // wrong type
      },
      expected: false,
    },
  ];

  it.each(cases)("$name", ({ input, expected }) => {
    const result = fetchPullRequestOutputSchema.safeParse(input);
    expect(result.success).toBe(expected);
  });
});

describe("reviewAgentOutputSchema", () => {
  const cases = [
    {
      name: "should validate correct review agent output",
      input: { review: "This looks good." },
      expectedSuccess: true,
    },
    {
      name: "should invalidate if review is missing",
      input: {},
      expectedSuccess: false,
    },
    {
      name: "should invalidate if review is not a string",
      input: { review: 123 },
      expectedSuccess: false,
    },
  ];

  it.each(cases)("$name", ({ input, expectedSuccess }) => {
    const result = reviewAgentOutputSchema.safeParse(input);
    expect(result.success).toBe(expectedSuccess);
  });
});

describe("generateOutputSchema", () => {
  const cases = [
    {
      name: "should validate correct generate output",
      input: { path: "/path/to/report.md" },
      expectedSuccess: true,
    },
    {
      name: "should invalidate if path is missing",
      input: {},
      expectedSuccess: false,
    },
    {
      name: "should invalidate if path is not a string",
      input: { path: 123 },
      expectedSuccess: false,
    },
  ];

  it.each(cases)("$name", ({ input, expectedSuccess }) => {
    const result = generateOutputSchema.safeParse(input);
    expect(result.success).toBe(expectedSuccess);
  });
});
