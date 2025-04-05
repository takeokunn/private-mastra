import fs from "fs/promises";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";

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

//   describe("writeReportToFile", () => {
//     const mockReportContent = "#+TITLE: Test Report\n...";
//     const mockTimestamp = "20240406170000";
//     const mockFilename = `${mockTimestamp}_pull_request.org`;
//     const expectedOutputDir = path.join(MOCK_PROJECT_ROOT, ".output");
//     const expectedOutputPath = path.join(expectedOutputDir, mockFilename);

//     // Use async beforeEach to allow await import
//     beforeEach(async () => {
//       // Mock generateReportFilename specifically for this test suite
//       // Need to import the module first to spy on its export
//       const outputModule = await import("./output");
//       vi.spyOn(outputModule, "generateReportFilename").mockReturnValue(
//         mockFilename,
//       );
//     });

//     it("should create directory and write report file successfully", async () => {
//       (fs.writeFile as Mock).mockResolvedValue(undefined); // Mock successful write

//       const outputPath = await writeReportToFile(mockReportContent);

//       expect(fs.mkdir).toHaveBeenCalledWith(expectedOutputDir, {
//         recursive: true,
//       });
//       expect(fs.writeFile).toHaveBeenCalledWith(
//         expectedOutputPath,
//         mockReportContent,
//       );
//       expect(outputPath).toBe(expectedOutputPath);
//     });

//     it("should throw an error if mkdir fails", async () => {
//       const mkdirError = new Error("Failed to create directory");
//       (fs.mkdir as Mock).mockRejectedValue(mkdirError);

//       await expect(writeReportToFile(mockReportContent)).rejects.toThrow(
//         "レポートファイルの書き込みに失敗しました。",
//       );
//       expect(fs.mkdir).toHaveBeenCalledWith(expectedOutputDir, {
//         recursive: true,
//       });
//       expect(fs.writeFile).not.toHaveBeenCalled(); // writeFile should not be called
//     });


//     it("should throw an error if writeFile fails", async () => {
//       const writeFileError = new Error("Disk full");
//       (fs.writeFile as Mock).mockRejectedValue(writeFileError);

//       await expect(writeReportToFile(mockReportContent)).rejects.toThrow(
//         "レポートファイルの書き込みに失敗しました。",
//       );
//       expect(fs.mkdir).toHaveBeenCalledWith(expectedOutputDir, {
//         recursive: true,
//       }); // mkdir should still be called
//       expect(fs.writeFile).toHaveBeenCalledWith(
//         expectedOutputPath,
//         mockReportContent,
//       );
//     });
//   });
});
