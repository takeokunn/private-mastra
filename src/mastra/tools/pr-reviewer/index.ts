import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { executePrReview } from "../pr-reviewer/execute";

export const prReviewerTool = createTool({
  id: "pr-reviewer",
  description:
    "GitHub プルリクエストの情報（詳細、ファイルリスト、差分）を取得し、基本的な Org Mode 形式のレビューレポートを生成します。",
  inputSchema: z.object({
    prUrl: z.string().url().describe("GitHub プルリクエストの完全な URL"),
  }),
  outputSchema: z.object({
    reportPath: z.string().describe("生成されたレビューレポートファイルへの絶対パス"),
  }),
  execute: async ({ context }): Promise<{ reportPath: string }> => await executePrReview(context.prUrl),
});
