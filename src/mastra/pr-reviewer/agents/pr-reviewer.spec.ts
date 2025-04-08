import { describe, expect, it } from "vitest";
import { prReviewerAgent } from "./pr-reviewer";
import { prReviewerTool } from "../tools";

describe("prReviewerAgent", () => {
  it("should have the correct attribute", () => {
    expect(prReviewerAgent.name).toBe("Pull Request Agent");
    expect(prReviewerAgent.instructions).toContain(
      "あなたはGitHubのプルリクエストレビューを担当する熟練のソフトウェア開発者です。",
    );
    expect(prReviewerAgent.instructions).toContain("「pr-reviewer」ツールを実行します。");
  });

  it("should include the prReviewerTool", () => {
    expect(prReviewerAgent.tools).toHaveProperty("prReviewerTool");
    expect(prReviewerAgent.tools.prReviewerTool).toBe(prReviewerTool);
  });
});
