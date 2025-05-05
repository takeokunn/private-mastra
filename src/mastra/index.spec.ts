import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";
import { describe, expect, it, vi } from "vitest";
import { mastra } from "./index";

vi.mock("@mastra/core/logger", () => ({
  createLogger: vi.fn(),
}));

describe("Mastra Instance (src/mastra/index.ts)", () => {
  it("should be an instance of Mastra", () => {
    expect(mastra).toBeInstanceOf(Mastra);
    expect(mastra.getAgent("weatherAgent")).toBeDefined();
    expect(mastra.getWorkflow("prReviewWorkflow")).toBeDefined();
  });

  it("should configure the logger correctly", async () => {
    const mockedCreateLogger = vi.mocked(createLogger);
    expect(mockedCreateLogger).toHaveBeenCalledTimes(1);
    expect(mockedCreateLogger).toHaveBeenCalledWith({ name: "Mastra", level: "info" });
  });
});
