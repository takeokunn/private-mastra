import path from "path";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateReportFilename, writeReportToFile } from "./output";

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
