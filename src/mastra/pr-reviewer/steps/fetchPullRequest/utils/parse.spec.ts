import { describe, expect, it } from "vitest";
import { parsePullRequestUrl } from "./parse";

const errorMessage =
  "[InvalidUrl] 不正な PR URL フォーマットです。期待されるフォーマット: https://github.com/owner/repo/pull/number";

describe("parsePullRequestUrl", () => {
  describe("正常系: 正しい GitHub PR URL のパース", () => {
    const validCases = [
      {
        name: "https",
        url: "https://github.com/mastra-ai/mastra/pull/123",
        expected: { owner: "mastra-ai", repo: "mastra", pull_number: 123 },
      },
      {
        name: "http",
        url: "http://github.com/another-owner/another-repo/pull/456",
        expected: {
          owner: "another-owner",
          repo: "another-repo",
          pull_number: 456,
        },
      },
      {
        name: "www付きURL",
        url: "https://www.github.com/owner-with-www/repo-name/pull/789",
        expected: {
          owner: "owner-with-www",
          repo: "repo-name",
          pull_number: 789,
        },
      },
    ];

    it.each(validCases)("正しくパースされる ($name)", ({ url, expected }) => {
      expect(parsePullRequestUrl(url)).toEqual(expected);
    });
  });

  describe("異常系: 不正な PR URL", () => {
    const invalidCases = [
      {
        name: "GitLab の URL",
        url: "https://gitlab.com/owner/repo/merge_requests/1",
      },
      {
        name: "Issue ページの URL",
        url: "https://github.com/owner/repo/issues/123",
      },
      {
        name: "repo が欠けている URL",
        url: "https://github.com/owner/pull/123",
      },
      {
        name: "完全に不正な文字列",
        url: "invalid-url-string",
      },
      {
        name: "空文字列",
        url: "",
      },
    ];

    it.each(invalidCases)("例外が投げられる ($name)", ({ url }) => {
      expect(() => parsePullRequestUrl(url)).toThrow(errorMessage);
    });
  });
});
