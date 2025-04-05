import { describe, expect, it } from "vitest";
import { prReviewerAgent } from "./pr-reviewer";
import { prReviewerTool } from "../tools/pr-reviewer";
import { google } from "@ai-sdk/google";

describe("prReviewerAgent", () => {
  it("should have the correct name", () => {
    expect(prReviewerAgent.name).toBe("Pull Request Agent");
  });

  it("should have the correct instructions", () => {
    expect(prReviewerAgent.instructions).toContain("あなたはGitHubのプルリクエストレビューを担当する熟練のソフトウェア開発者です。");
    expect(prReviewerAgent.instructions).toContain("「pr-reviewer」ツールを実行します。");
  });

  it("should use the correct model", () => {
    // Note: Comparing model instances directly might be tricky.
    // We check if it's using the google provider and the specific model ID.
    // This assumes the internal structure or relies on a stable identifier.
    // A more robust check might involve inspecting the model configuration if accessible.
    expect(prReviewerAgent.model.provider).toBe(google.provider);
    expect(prReviewerAgent.model.modelId).toBe("models/gemini-1.5-pro-latest");
  });

  it("should include the prReviewerTool", () => {
    expect(prReviewerAgent.tools).toHaveProperty("prReviewerTool");
    expect(prReviewerAgent.tools.prReviewerTool).toBe(prReviewerTool);
  });

  // Example of a future test (requires mocking tool execution)
  // it('should call prReviewerTool when asked to review a PR', async () => {
  //   // Mock the tool's execute function
  //   const mockExecute = vi.spyOn(prReviewerTool, 'execute').mockResolvedValue({ reportPath: '/fake/path/report.org' });
  //
  //   // Simulate an interaction (this part depends on how you interact with the agent, e.g., using a session)
  //   // const session = createAgentSession(prReviewerAgent);
  //   // const response = await session.prompt('Review this PR: https://github.com/example/repo/pull/1');
  //
  //   // expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({
  //   //   context: { prUrl: 'https://github.com/example/repo/pull/1' }
  //   // }));
  //   // expect(response).toContain('/fake/path/report.org');
  //
  //   mockExecute.mockRestore(); // Clean up the mock
  // });
});
