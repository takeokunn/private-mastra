import { describe, it, expect } from "vitest";
import { designDocReviewerTool } from "./design-docs-reviewer";

describe("designDocReviewerTool", () => {
  it("should have the correct name and description", () => {
    expect(designDocReviewerTool.name).toBe("designDocReviewerTool");
    expect(designDocReviewerTool.description).toBe(
      "指定されたURLからデザインドキュメントを分析します。",
    );
  });

  it("should define input and output schemas", () => {
    expect(designDocReviewerTool.inputSchema).toBeDefined();
    expect(designDocReviewerTool.outputSchema).toBeDefined();
  });

  it("should execute with valid input (placeholder test)", async () => {
    const validInput = {
      docUrl: "https://example.com/valid-design-doc",
    };

    // Validate input using Zod schema if needed (createTool might handle this)
    // const parseResult = designDocReviewerTool.inputSchema?.safeParse(validInput);
    // expect(parseResult?.success).toBe(true);

    // if (parseResult?.success) {
    const result = await designDocReviewerTool.execute(validInput);
    expect(result).toBeDefined();
    expect(result.status).toContain(
      `デザインドキュメント ${validInput.docUrl} を分析しました（プレースホルダー）。`,
    );
    // }
  });

  // TODO: Add tests for invalid input if not handled by createTool schema validation
  // TODO: Add tests for the actual analysis logic once implemented
});
