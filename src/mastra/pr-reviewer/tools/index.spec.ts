import { describe, it, expect, vi, beforeEach } from "vitest";
import { prReviewerTool } from "../tools";
import * as executeModule from "../tools/execute";

describe("prReviewerTool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have correct id and description", () => {
    expect(prReviewerTool.id).toBe("pr-reviewer");
    expect(typeof prReviewerTool.description).toBe("string");
    expect(prReviewerTool.description.length).toBeGreaterThan(0);
  });

  it("should validate input schema", () => {
    const valid = { prUrl: "https://github.com/owner/repo/pull/123" };
    expect(() => prReviewerTool.inputSchema!.parse(valid)).not.toThrow();

    const invalid = { prUrl: "not-a-url" };
    expect(() => prReviewerTool.inputSchema!.parse(invalid)).toThrow();
  });

  it("should validate output schema", () => {
    const valid = { reportPath: "/tmp/report.org" };
    expect(() => prReviewerTool.outputSchema!.parse(valid)).not.toThrow();

    const invalid = { reportPath: 123 };
    expect(() => prReviewerTool.outputSchema!.parse(invalid)).toThrow();
  });

  it("should call executePrReview with prUrl and return reportPath", async () => {
    const mockExecute = vi.spyOn(executeModule, "executePrReview").mockResolvedValue({ reportPath: "/tmp/report.org" });

    const result = await prReviewerTool.execute!({
      context: { prUrl: "https://github.com/owner/repo/pull/123" },
    } as any);

    expect(mockExecute).toHaveBeenCalledWith("https://github.com/owner/repo/pull/123");
    expect(result).toEqual({ reportPath: "/tmp/report.org" });
  });
});
