import { describe, expect, it } from "vitest";

import { parsePrUrl } from "./parse";

describe("parsePrUrl", () => {
  it("should parse a valid GitHub PR URL", () => {
    const url = "https://github.com/mastra-ai/mastra/pull/123";
    const expected = {
      owner: "mastra-ai",
      repo: "mastra",
      pull_number: 123,
    };
    expect(parsePrUrl(url)).toEqual(expected);
  });

  it("should parse a valid GitHub PR URL with http", () => {
    const url = "http://github.com/another-owner/another-repo/pull/456";
    const expected = {
      owner: "another-owner",
      repo: "another-repo",
      pull_number: 456,
    };
    expect(parsePrUrl(url)).toEqual(expected);
  });

  it("should parse a valid GitHub PR URL with www", () => {
    const url = "https://www.github.com/owner-with-www/repo-name/pull/789";
    const expected = {
      owner: "owner-with-www",
      repo: "repo-name",
      pull_number: 789,
    };
    expect(parsePrUrl(url)).toEqual(expected);
  });

  it("should throw an error for an invalid URL format (not GitHub)", () => {
    const url = "https://gitlab.com/owner/repo/merge_requests/1";
    expect(() => parsePrUrl(url)).toThrow(
      "[InvalidUrl] 不正な PR URL フォーマットです。期待されるフォーマット: https://github.com/owner/repo/pull/number",
    );
  });

  it("should throw an error for an invalid URL format (not a PR)", () => {
    const url = "https://github.com/owner/repo/issues/123";
    expect(() => parsePrUrl(url)).toThrow(
      "[InvalidUrl] 不正な PR URL フォーマットです。期待されるフォーマット: https://github.com/owner/repo/pull/number",
    );
  });

  it("should throw an error for an invalid URL format (missing parts)", () => {
    const url = "https://github.com/owner/pull/123";
    expect(() => parsePrUrl(url)).toThrow(
      "[InvalidUrl] 不正な PR URL フォーマットです。期待されるフォーマット: https://github.com/owner/repo/pull/number",
    );
  });

  it("should throw an error for an invalid URL format (malformed)", () => {
    const url = "invalid-url-string";
    expect(() => parsePrUrl(url)).toThrow(
      "[InvalidUrl] 不正な PR URL フォーマットです。期待されるフォーマット: https://github.com/owner/repo/pull/number",
    );
  });

  it("should throw an error for an empty string", () => {
    const url = "";
    expect(() => parsePrUrl(url)).toThrow(
      "[InvalidUrl] 不正な PR URL フォーマットです。期待されるフォーマット: https://github.com/owner/repo/pull/number",
    );
  });
});
