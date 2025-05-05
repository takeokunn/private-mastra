import { describe, it, expect } from "vitest";
import { workflow } from "./workflows";
import { WORKFLOW } from "./const";

describe("pr-review workflow", () => {
  it("should have the correct name", () => {
    expect(workflow.name).toBe("pr-review workflow");
  });

  it("should contain the expected steps in order", () => {
    const steps = workflow.steps;
    // githubの情報取得
    expect(steps[WORKFLOW.FETCH_PULL_REQUEST]).toBeDefined()

    // レビューエージェント
    expect(steps[WORKFLOW.REVIEW_AGENT.SUMMARY]).toBeDefined()
    expect(steps[WORKFLOW.REVIEW_AGENT.ARCHITECTURE]).toBeDefined()
    expect(steps[WORKFLOW.REVIEW_AGENT.CODE_QUALITY]).toBeDefined()
    expect(steps[WORKFLOW.REVIEW_AGENT.SECURITY]).toBeDefined()
    expect(steps[WORKFLOW.REVIEW_AGENT.PERFORMANCE]).toBeDefined()
    expect(steps[WORKFLOW.REVIEW_AGENT.TESTING]).toBeDefined()

    // レポート作成
    expect(steps[WORKFLOW.GENERATE_REPORT]).toBeDefined()
  });
});
