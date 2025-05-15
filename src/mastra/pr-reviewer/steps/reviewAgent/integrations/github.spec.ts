import { describe, it, expect } from "vitest";
import { tool } from "./github";

describe("github integration tool", () => {
  it("should have the correct id and description", () => {
    expect(tool.id).toBe("github-integration");
    expect(tool.description).toBe("github-integration tool");
  });
});
