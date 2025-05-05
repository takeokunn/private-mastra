import { describe, it, expect, vi } from "vitest";
import { fetchPullRequest } from "./index";
import { execute as executeImplementation } from "./execute";
import { fetchPullRequestOutputSchema, workflowInputSchema } from "@src/mastra/pr-reviewer/schema";
import { WORKFLOW } from "@src/mastra/pr-reviewer/const";
import type { WorkflowContext } from "@mastra/core";

// ./execute モジュールをモック化
vi.mock("./execute", () => ({
  execute: vi.fn(),
}));

// モックされた execute 関数を取得
const mockedExecute = vi.mocked(executeImplementation);

describe("fetchPullRequest Step", () => {
  it("should have the correct id, inputSchema, and outputSchema", () => {
    expect(fetchPullRequest.id).toBe(WORKFLOW.FETCH_PULL_REQUEST);
    expect(fetchPullRequest.inputSchema).toBe(workflowInputSchema);
    expect(fetchPullRequest.outputSchema).toBe(fetchPullRequestOutputSchema);
  });

  it("should call the execute implementation with the context", async () => {
    const mockContext = {
      triggerData: {
        inputSchema: { url: "https://github.com/test/repo/pull/1" },
      },
      // 必要に応じて他のコンテキストプロパティを追加
    } as unknown as WorkflowContext;

    const mockExecuteResult = {
        parts: { owner: "test", repo: "repo", pull_number: 1 },
        details: { owner: "test", repo: "repo", pull_number: 1, title: "t", body: null, html_url: "url", base_sha: "b", head_sha: "h" },
        files: [],
        diff: "",
    };
    mockedExecute.mockResolvedValue(mockExecuteResult); // モックされた execute が返す値を設定

    // Step の execute を呼び出す
    const result = await fetchPullRequest.execute({ context: mockContext });

    // 内部の execute が正しいコンテキストで呼び出されたかを確認
    expect(mockedExecute).toHaveBeenCalledWith(mockContext);
    // Step の execute が内部の execute の結果を返すかを確認
    expect(result).toBe(mockExecuteResult);
  });

   it("should handle errors from the execute implementation", async () => {
    const mockContext = {
      triggerData: {
        inputSchema: { url: "https://github.com/test/repo/pull/1" },
      },
    } as unknown as WorkflowContext;
    const mockError = new Error("Execution failed");
    mockedExecute.mockRejectedValue(mockError); // モックされた execute がエラーをスローするように設定

    // Step の execute を呼び出し、エラーがスローされることを確認
    await expect(fetchPullRequest.execute({ context: mockContext }))
      .rejects.toThrow(mockError);

    // 内部の execute が正しいコンテキストで呼び出されたかを確認
    expect(mockedExecute).toHaveBeenCalledWith(mockContext);
  });
});
