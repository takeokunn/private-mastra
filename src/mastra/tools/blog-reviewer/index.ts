import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { executeBlogReviewer } from "./execute";
import type { BlogReviewerOutput } from "./types";

// Zodスキーマを定義して入力のバリデーションを行う
const blogReviewerSchema = z.object({
  contentOrUrl: z
    .string()
    .min(10, "記事の内容またはURLは10文字以上で入力してください。")
    .describe("レビュー対象のブログ記事の内容またはURL"),
});

/**
 * ブログ記事レビューツール
 * 指定されたブログ記事の内容またはURLを受け取り、改善点を提案します。
 */
export const blogReviewerTool = tool(
  async (input: z.infer<typeof blogReviewerSchema>) => {
    // TODO: config を使った処理が必要な場合はここに追加
    console.log("Blog Reviewer Tool received input:", input);
    const result = await executeBlogReviewer(input);
    console.log("Blog Reviewer Tool produced output:", result);
    // tool の戻り値は string である必要がある場合が多いので、
    // 結果を整形して返すか、Agent側で適切に処理する必要がある。
    // ここでは例としてJSON文字列を返す。
    return JSON.stringify(result);
  },
  {
    name: "blog_reviewer",
    description:
      "ブログ記事の内容またはURLを受け取り、構成、表現、SEOなどの観点からレビューし、改善点を提案します。",
    schema: blogReviewerSchema,
    // LangChainの tool 関数の型定義によっては outputSchema は直接サポートされない場合がある
    // 必要に応じて Agent 側でパースするなどの対応が必要
    // outputSchema: z.object({
    //   summary: z.string(),
    //   suggestions: z.array(z.string()),
    // }),
  },
);
