import path from "path";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateOrgReport, generateReportFilename, writeReportToFile } from "./output";
import type { PrDetails, PrFileInfo } from "./types";

vi.mock("fs/promises", () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

const MOCK_PROJECT_ROOT = "/mock/project/root";
vi.spyOn(process, "cwd").mockImplementation(() => MOCK_PROJECT_ROOT);

describe("PR Output Functions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe("generateReportFilename", () => {
    it("should generate a filename with the correct timestamp format based on UTC", () => {
      const mockUtcDate = new Date(Date.UTC(2024, 3, 6, 15, 30, 45));
      vi.setSystemTime(mockUtcDate);

      const filename = generateReportFilename();
      const expectedTimestamp = "20240406T15304";
      expect(filename).toBe(`${expectedTimestamp}_pull_request.org`);
    });
  });

  describe("generateOrgReport", () => {
    const mockPrDetails: PrDetails = {
      owner: "test-owner",
      repo: "test-repo",
      pull_number: 42,
      title: "Feat: Implement amazing feature",
      body: "This PR implements the amazing feature.\n\n- Does X\n- Does Y",
      html_url: "https://github.com/test-owner/test-repo/pull/42",
      base_sha: "base123",
      head_sha: "head456",
    };

    const mockFiles: PrFileInfo[] = [
      {
        filename: "src/feature.ts",
        status: "modified",
        changes: 15,
        additions: 10,
        deletions: 5,
      },
      {
        filename: "test/feature.spec.ts",
        status: "added",
        changes: 30,
        additions: 30,
        deletions: 0,
      },
    ];

    const mockDiff = `diff --git a/src/feature.ts b/src/feature.ts
index abc..def 100644
--- a/src/feature.ts
+++ b/src/feature.ts
@@ -1,1 +1,2 @@
 console.log("hello");
+console.log("world");
`;

    it("should generate a complete Org Mode report", () => {
      const mockDate = new Date(2024, 3, 6, 16, 0, 0);
      vi.setSystemTime(mockDate);
      const report = generateOrgReport(mockPrDetails, mockFiles, mockDiff);

      // Basic checks for key elements
      expect(report).toContain(`#+TITLE: プルリクエストレビュー: ${mockPrDetails.title}`);
      expect(report).toContain(`#+DATE: ${mockDate.toISOString()}`);
      expect(report).toContain(`#+PROPERTY: PR_URL ${mockPrDetails.html_url}`);
      expect(report).toContain(`#+PROPERTY: REPO ${mockPrDetails.owner}/${mockPrDetails.repo}`);
      expect(report).toContain(`#+PROPERTY: PR_NUMBER ${mockPrDetails.pull_number}`);
      expect(report).toContain(`#+PROPERTY: BASE_SHA ${mockPrDetails.base_sha}`);
      expect(report).toContain(`#+PROPERTY: HEAD_SHA ${mockPrDetails.head_sha}`);
    });
  });

  describe("writeReportToFile", () => {
    const mockFilename = `20240406T15304_pull_request.org`;
    const mockReportContent = "#+TITLE: Test Report\n...";
    const expectedOutputDir = path.join(MOCK_PROJECT_ROOT, ".output");
    const expectedOutputPath = path.join(expectedOutputDir, mockFilename);

    const originalCwd = process.cwd;

    beforeEach(async () => {
      const mockUtcDate = new Date(Date.UTC(2024, 3, 6, 15, 30, 45));
      vi.setSystemTime(mockUtcDate);

      Object.defineProperty(process, "cwd", { value: vi.fn().mockReturnValue(MOCK_PROJECT_ROOT) });

      const outputModule = await import("./output");
      vi.spyOn(outputModule, "generateReportFilename").mockReturnValue(mockFilename);
    });

    afterAll(() => {
      process.cwd = originalCwd;
    });

    it("should create directory and write report file successfully", async () => {
      const outputPath = await writeReportToFile(mockReportContent);
      expect(outputPath).toBe(expectedOutputPath);
    });
  });
});
