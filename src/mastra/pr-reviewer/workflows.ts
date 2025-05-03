import { Step, Workflow } from "@mastra/core";
import { z } from "zod";
import { fetchPullRequest as fetchPullRequestTool } from "./tools/fetch-pull-request";
import { pullRequestReviewerAgent } from "./agents/pr-reviewer";

const workflow = new Workflow({
  name: "pr-review workflow",
  triggerSchema: z.object({
    inputSchema: z.object({
      pullRequestUrl: z.string().url().describe("GitHub プルリクエストの完全な URL"),
    }),
  })
});

const fetchPullRequestOutputSchema = z.object({
  parts: z.object({
    owner: z.string(),
    repo: z.string(),
    pull_number: z.number()
  }),
  details: z.object({
    owner: z.string(),
    repo: z.string(),
    pull_number: z.number(),
    title: z.string(),
    body: z.string().nullable(),
    html_url: z.string(),
    base_sha: z.string(),
    head_sha: z.string(),
  }),
  files: z.array(
    z.object({
      filename: z.string(),
      status: z.string(),
      changes: z.number(),
      additions: z.number(),
      deletions: z.number(),
    })
  ),
  diff: z.string()
})

const fetchPullRequest = new Step({
  id: "fetchPullRequest",
  inputSchema: z.object({
    pullRequestUrl: z.string().url()
  }),
  outputSchema: fetchPullRequestOutputSchema,
  execute: async ({ context }) => await fetchPullRequestTool(context.triggerData?.inputSchema.pullRequestUrl)
});

const codeQualityReviewAgent = new Step({
  id: 'reviewAgent',
  inputSchema: fetchPullRequestOutputSchema,
  outputSchema: z.string(),
  execute: async ({ context }) => {
    const prompt = `
以下のdiffをレビューして

${context.inputData.diff}
`
    const result = await pullRequestReviewerAgent.generate(prompt, {
      output: z.object({
        review: z.string()
      }),
    })
    return result.object.review
  }
})

const securityReviewAgent = new Step({
  id: 'reviewAgent',
  inputSchema: fetchPullRequestOutputSchema,
  outputSchema: z.string(),
  execute: async ({ context }) => {
    const prompt = `
以下のdiffをレビューして

${context.inputData.diff}
`
    const result = await pullRequestReviewerAgent.generate(prompt, {
      output: z.object({
        review: z.string()
      }),
    })
    return result.object.review
  }
})

const generateReport = new Step({
  id: 'generateReport',
  outputSchema: z.object({}),
  execute: async ({ context }) => {
    return {}
  }
})

workflow
  // githubの情報取得
  .step(fetchPullRequest)
  .after(fetchPullRequest)

  // レビューエージェント実行
  // 【A. コード品質・可読性（Style & Clean Code）】
  // 【B. 設計・責務分離（Architecture & Modularity）】
  // 【C. セキュリティ・安全性（Security）】
  // 【D. パフォーマンス・リソース効率（Performance）】
  // 【E. テスト・CI/CD整合性（Testing & Toolchain）】
  // 関連技術事項
  .step(codeQualityReviewAgent)
  .step(securityReviewAgent)
  .after([codeQualityReviewAgent, securityReviewAgent])

  // レポート作成
  .step(generateReport)
  .commit();

export { workflow }
