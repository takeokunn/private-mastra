import { describe, it, expect } from "vitest";
import { designDocsReviewerAgent } from "./design-docs-reviewer";
import { DesignDocsReviewerInputSchema } from "../types";

describe("designDocsReviewerAgent", () => {
  it("should have the correct name and description", () => {
    expect(designDocsReviewerAgent.name).toBe("designDocsReviewerAgent");
    expect(designDocsReviewerAgent.description).toBe(
      "指定されたURLに基づいてデザインドキュメントをレビューします。",
    );
  });

  it("should define input and output types", () => {
    expect(designDocsReviewerAgent.inputTypeDef).toBe(
      DesignDocsReviewerInputSchema,
    );
    // Assuming outputTypeDef is also defined, add expect(designDocsReviewerAgent.outputTypeDef).toBeDefined(); if needed
  });

  it("should run with valid input (placeholder test)", async () => {
    const validInput = {
      docUrl: "https://example.com/design-doc",
    };

    // Validate input using Zod schema
    const parseResult =
      designDocsReviewerAgent.inputTypeDef?.safeParse(validInput);
    expect(parseResult?.success).toBe(true);

    if (parseResult?.success) {
      const result = await designDocsReviewerAgent.run(parseResult.data);
      expect(result).toBeDefined();
      expect(result.message).toContain(
        `デザインドキュメント ${validInput.docUrl} をレビューしました（プレースホルダー）。`,
      );
      // Add more specific assertions based on expected output structure
      expect(result.suggestions).toBeUndefined(); // Or check for an empty array if that's the default
    }
  });

  it("should handle invalid input (placeholder test)", async () => {
    const invalidInput = { docUrl: "not-a-url" };
    const parseResult =
      designDocsReviewerAgent.inputTypeDef?.safeParse(invalidInput);
    expect(parseResult?.success).toBe(false);
    // Optionally, check the specific error message
    // if (!parseResult?.success) {
    //   expect(parseResult.error.errors[0].message).toContain("Invalid url");
    // }
  });

  // TODO: Add more tests, including tests for tool integration if applicable
});
