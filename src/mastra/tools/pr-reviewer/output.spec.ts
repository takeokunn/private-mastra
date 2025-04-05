import fs from "fs/promises";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  generateOrgReport,
  generateReportFilename,
  writeReportToFile,
} from "./output";
import type { PrDetails, PrFileInfo } from "./types";

// Mock fs/promises
vi.mock("fs/promises", () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

// Mock process.cwd() to ensure consistent paths
const MOCK_PROJECT_ROOT = "/mock/project/root";
vi.spyOn(process, "cwd").mockReturnValue(MOCK_PROJECT_ROOT);

describe("PR Output Functions", () => {
  beforeEach(() => {
    // Use fake timers to control Date
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers and reset mocks
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe("generateReportFilename", () => {
    it("should generate a filename with the correct timestamp format", () => {
      const mockDate = new Date(2024, 3, 6, 15, 30, 45); // April 6, 2024 15:30:45
      vi.setSystemTime(mockDate);

      const filename = generateReportFilename();
      // Expected format: YYYYMMDDHHMMSS_pull_request.org
      // Note: getMonth() is 0-indexed, so April is 3.
      // toISOString() returns UTC, adjust if needed based on expected behavior.
      // Assuming the function uses local time implicitly converted by toISOString logic:
      // Let's refine the expectation based on toISOString behavior.
      // 2024-04-06T15:30:45.000Z (assuming UTC for simplicity in test)
      // -> 20240406153045
      // If local time zone matters, the test might need adjustment.
      // Let's assume the slice(0, 14) logic aims for YYYYMMDDHHMMSS.
      const expectedTimestamp = "20240406153045"; // Based on the mock date set
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
      expect(report).toContain(
        `#+TITLE: プルリクエストレビュー: ${mockPrDetails.title}`,
      );
      expect(report).toContain(`#+DATE: ${mockDate.toISOString()}`);
      expect(report).toContain(`#+PROPERTY: PR_URL ${mockPrDetails.html_url}`);
      expect(report).toContain(
        `#+PROPERTY: REPO ${mockPrDetails.owner}/${mockPrDetails.repo}`,
      );
      expect(report).toContain(
        `#+PROPERTY: PR_NUMBER ${mockPrDetails.pull_number}`,
      );
      expect(report).toContain(`#+PROPERTY: BASE_SHA ${mockPrDetails.base_sha}`);
      expect(report).toContain(`#+PROPERTY: HEAD_SHA ${mockPrDetails.head_sha}`);
      expect(report).toContain(`* PR 詳細`);
      expect(report).toContain(`- *タイトル*: ${mockPrDetails.title}`);
      expect(report).toContain(`- *URL*: ${mockPrDetails.html_url}`);
      expect(report).toContain(`- *説明*:\n    ${mockPrDetails.body}`);
      expect(report).toContain(`* 変更概要`);
      expect(report).toContain(`** 変更ファイル (${mockFiles.length})`);
      expect(report).toContain(
        `- ${mockFiles[0].filename} (${mockFiles[0].status}, +${mockFiles[0].additions}/-${mockFiles[0].deletions})`,
      );
      expect(report).toContain(
        `- ${mockFiles[1].filename} (${mockFiles[1].status}, +${mockFiles[1].additions}/-${mockFiles[1].deletions})`,
      );
      expect(report).toContain(`** 差分サマリー`);
      // Check if diff is included (truncated or full if short)
      expect(report).toContain("```diff");
      expect(report).toContain(mockDiff); // Check if the start of the diff is present
      expect(report).toContain("```");
      expect(report).toContain(`* 分析 (プレースホルダー)`);
      expect(report).toContain("[静的解析結果プレースホルダー - 未実装]");
      expect(report).toContain("[テスト結果プレースホルダー - 未実装]");
      expect(report).toContain(`* 推奨事項`);
      expect(report).toContain(
        "- [X] 要手動レビュー / 追加対応 (Needs Manual Review / Further Action)",
      );
    });

    it("should handle null PR body", () => {
      const detailsWithNullBody = { ...mockPrDetails, body: null };
      const report = generateOrgReport(detailsWithNullBody, mockFiles, mockDiff);
      expect(report).toContain("- *説明*:\n    説明なし");
    });

    it("should handle empty file list", () => {
      const report = generateOrgReport(mockPrDetails, [], mockDiff);
      expect(report).toContain("** 変更ファイル (0)");
      expect(report).toContain(
        "変更されたファイルがないか、ファイルリストを取得できませんでした。",
      );
    });

    it("should handle empty diff", () => {
      const report = generateOrgReport(mockPrDetails, mockFiles, "");
      expect(report).toContain("差分を取得できませんでした。");
    });

    it("should truncate long diffs", () => {
      const longDiff = "a".repeat(2000);
      const report = generateOrgReport(mockPrDetails, mockFiles, longDiff);
      expect(report).toContain(longDiff.substring(0, 1500));
      expect(report).toContain("... \n[差分は簡潔さのために切り捨てられています]");
      expect(report).not.toContain(longDiff); // Ensure the full long diff isn't there
    });
  });

  describe("writeReportToFile", () => {
    const mockReportContent = "#+TITLE: Test Report\n...";
    const mockTimestamp = "20240406170000";
    const mockFilename = `${mockTimestamp}_pull_request.org`;
    const expectedOutputDir = path.join(MOCK_PROJECT_ROOT, ".output");
    const expectedOutputPath = path.join(expectedOutputDir, mockFilename);

    beforeEach(() => {
      // Mock generateReportFilename specifically for this test suite
      vi.spyOn(
        await import("./output"), // Use dynamic import to spy on exported function
        "generateReportFilename",
      ).mockReturnValue(mockFilename);
    });

    it("should create directory and write report file successfully", async () => {
      (fs.writeFile as vi.Mock).mockResolvedValue(undefined); // Mock successful write

      const outputPath = await writeReportToFile(mockReportContent);

      expect(fs.mkdir).toHaveBeenCalledWith(expectedOutputDir, {
        recursive: true,
      });
      expect(fs.writeFile).toHaveBeenCalledWith(
        expectedOutputPath,
        mockReportContent,
      );
      expect(outputPath).toBe(expectedOutputPath);
    });

    it("should throw an error if mkdir fails", async () => {
      const mkdirError = new Error("Failed to create directory");
      (fs.mkdir as vi.Mock).mockRejectedValue(mkdirError);

      await expect(writeReportToFile(mockReportContent)).rejects.toThrow(
        "レポートファイルの書き込みに失敗しました。",
      );
      expect(fs.mkdir).toHaveBeenCalledWith(expectedOutputDir, {
        recursive: true,
      });
      expect(fs.writeFile).not.toHaveBeenCalled(); // writeFile should not be called
    });


    it("should throw an error if writeFile fails", async () => {
      const writeFileError = new Error("Disk full");
      (fs.writeFile as vi.Mock).mockRejectedValue(writeFileError);

      await expect(writeReportToFile(mockReportContent)).rejects.toThrow(
        "レポートファイルの書き込みに失敗しました。",
      );
      expect(fs.mkdir).toHaveBeenCalledWith(expectedOutputDir, {
        recursive: true,
      }); // mkdir should still be called
      expect(fs.writeFile).toHaveBeenCalledWith(
        expectedOutputPath,
        mockReportContent,
      );
    });
  });
});
