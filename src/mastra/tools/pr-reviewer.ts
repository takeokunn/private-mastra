import { createTool } from "@mastra/core/tools";
import { Octokit } from "@octokit/rest";
import { Result, err, ok, fromPromise } from "neverthrow";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

const OUTPUT_DIR = ".output";

type PrUrlParts = {
  owner: string;
  repo: string;
  pull_number: number;
};

type PrDetails = {
  owner: string;
  repo: string;
  pull_number: number;
  title: string;
  body: string | null;
  html_url: string;
  base_sha: string;
  head_sha: string;
};

type PrFileInfo = {
  filename: string;
  status: string; // "added", "modified", "removed", etc.
  changes: number;
  additions: number;
  deletions: number;
};

type PrReviewError =
  | { type: "InvalidUrl"; message: string }
  | { type: "GitHubApiError"; message: string; error?: unknown }
  | { type: "FileWriteError"; message: string; error?: unknown }
  | { type: "MissingToken"; message: string };

/**
 * GitHub PR URL を解析し、owner, repo, pull number を抽出する。 */
/**
 * @param prUrl 解析対象の PR URL。
 * @returns 解析結果またはエラーを含む Result オブジェクト。
 */
const parsePrUrl = (prUrl: string): Result<PrUrlParts, PrReviewError> => {
  const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) {
    return err({
      type: "InvalidUrl",
      message: "不正な PR URL フォーマットです。期待されるフォーマット: https://github.com/owner/repo/pull/number",
    });
  }

  return ok({
    owner: match[1],
    repo: match[2],
    pull_number: parseInt(match[3], 10),
  });
};

/**
 * レポート用のタイムスタンプ付きファイル名を生成する。 */
/**
 * @returns 生成されたファイル名 (例: "20230101120000_pull_request.org")。
 */
const generateReportFilename = (): string => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.]/g, "").slice(0, 14); // YYYYMMDDHHMMSS
  return `${timestamp}_pull_request.org`;
}

/**
 * GitHub API から PR 詳細を取得する (Result 型でエラーハンドリング)。
 *
 * @param octokit Octokit インスタンス。
 * @param parts 解析済みの PR URL 情報。
 * @returns PR 詳細またはエラーを含む Promise<Result>。
 */
const getPrDetails = (octokit: Octokit, parts: PrUrlParts): Promise<Result<PrDetails, PrReviewError>> => {
  const promise = octokit.pulls.get({
    owner: parts.owner,
    repo: parts.repo,
    pull_number: parts.pull_number,
  });

  return fromPromise(promise, (error) => ({
    type: "GitHubApiError",
    message: `Failed to fetch PR details for ${parts.owner}/${parts.repo}#${parts.pull_number}`,
    error,
  })).map((response) => ({
    owner: parts.owner,
    repo: parts.repo,
    pull_number: parts.pull_number,
    title: response.data.title,
    body: response.data.body,
    html_url: response.data.html_url,
    base_sha: response.data.base.sha,
    head_sha: response.data.head.sha,
  }));
}

/**
 * GitHub API から変更されたファイルリストを取得する (Result 型を使用)。
 *
 * @param octokit Octokit インスタンス。
 * @param parts 解析済みの PR URL 情報。
 * @returns ファイル情報配列またはエラーを含む Promise<Result>。
 */
const getPrFiles = async (octokit: Octokit, parts: PrUrlParts): Promise<Result<PrFileInfo[], PrReviewError>> => {
  const promise = octokit.pulls.listFiles({
    owner: parts.owner,
    repo: parts.repo,
    pull_number: parts.pull_number,
  });

  return fromPromise(promise, (error) => ({
    type: "GitHubApiError",
    message: `Failed to fetch PR files for ${parts.owner}/${parts.repo}#${parts.pull_number}`,
    error,
  })).map((response) =>
    response.data.map((file) => ({
      filename: file.filename,
      status: file.status,
      changes: file.changes,
      additions: file.additions,
      deletions: file.deletions,
    })),
  );
}

/**
 * GitHub API から PR の差分 (diff) を取得する (Result 型を使用)。
 *
 * @param octokit Octokit インスタンス。
 * @param parts 解析済みの PR URL 情報。
 * @returns diff 文字列またはエラーを含む Promise<Result>。
 */
const getPrDiff = async (octokit: Octokit, parts: PrUrlParts): Promise<Result<string, PrReviewError>> => {
  const promise = octokit.pulls.get({
    owner: parts.owner,
    repo: parts.repo,
    pull_number: parts.pull_number,
    mediaType: {
      format: "diff",
    },
  });

  // mediaType format がレスポンス型を変更するため、型アサーションが必要
  return fromPromise(promise, (error) => ({
    type: "GitHubApiError",
    message: `PR diff の取得に失敗しました: ${parts.owner}/${parts.repo}#${parts.pull_number}`,
    error,
  })).map((response) => response.data as unknown as string);
}

/**
 * Org Mode 形式のレビューレポートを生成する。
 * (静的解析とテスト結果は現時点ではプレースホルダー)
 *
 * @param prDetails PR 詳細情報。
 * @param files 変更されたファイルの情報配列。
 * @param diff PR の差分文字列。
 * @returns 生成された Org Mode レポート文字列。
 */
const generateOrgReport = (prDetails: PrDetails, files: PrFileInfo[], diff: string): string => {
  const reportDate = new Date().toISOString();
  const fileSummary = files.map((f) => `- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`).join("\n");
  const staticAnalysisResult = "[Static Analysis Results Placeholder - Not Implemented]";
  const staticAnalysisResult = "[静的解析結果プレースホルダー - 未実装]";
  const testResult = "[テスト結果プレースホルダー - 未実装]";

  return `
#+TITLE: プルリクエストレビュー: ${prDetails.title}
#+DATE: ${reportDate}
#+AUTHOR: AI レビューアシスタント (via prReviewerTool)
#+PROPERTY: PR_URL ${prDetails.html_url}
#+PROPERTY: REPO ${prDetails.owner}/${prDetails.repo}
#+PROPERTY: PR_NUMBER ${prDetails.pull_number}
#+PROPERTY: BASE_SHA ${prDetails.base_sha}
#+PROPERTY: HEAD_SHA ${prDetails.head_sha}

* サマリー
  :PROPERTIES:
  :REVIEW_STATUS: 要手動レビュー (NEEDS MANUAL REVIEW)
  :END:
  このレポートには、PR から取得された基本情報が含まれています。詳細な分析（コード品質、テストなど）には、手動レビューまたは追加ツールの統合が必要です。

* PR 詳細
  - *タイトル*: ${prDetails.title}
  - *URL*: ${prDetails.html_url}
  - *説明*:
    ${prDetails.body || "説明なし"}

* 変更概要
** 変更ファイル (${files.length})
${fileSummary || "変更されたファイルがないか、ファイルリストを取得できませんでした。"}

** 差分サマリー
   \`\`\`diff
   ${diff ? `${diff.substring(0, 1500)}... \n[差分は簡潔さのために切り捨てられています]` : "差分を取得できませんでした。"}
   \`\`\`

* 分析 (プレースホルダー)
** コード品質と規約
   - *静的解析*:
     \`\`\`
     ${staticAnalysisResult}
     \`\`\`
   - *\`docs/rules.md\` 準拠*: [TODO: コーディング規約への準拠を分析]
   - *可読性・保守性*: [TODO: コードの可読性を評価]

** 機能性とロジック
   - *テスト結果*:
     \`\`\`
     ${testResult}
     \`\`\`
   - *カバレッジ*: [TODO: テストカバレッジを抽出して報告]
   - *ロジックレビュー*: [TODO: コアロジックの変更を分析]
   - *エッジケース*: [TODO: 潜在的なエッジケースを考慮]

** ドキュメンテーションとコメント
   - *TSDoc/コメント*: [TODO: 十分なドキュメントがあるか確認]
   - *関連する \`docs/domain.md\` の更新*: [TODO: ドメインドキュメントの更新が必要か確認]

* 推奨事項
  - [ ] 承認 (Approve)
  - [X] 要手動レビュー / 追加対応 (Needs Manual Review / Further Action)
  - [ ] 変更要求 (Request Changes)

  この自動レポートは出発点を提供します。手動レビューを推奨します。

* 次のステップ (ツール開発)
  - [ ] 静的解析ツールの実行を統合 (例: Biome)。
  - [ ] テスト実行とカバレッジレポートを統合 (例: Vitest)。
  - [ ] 詳細分析のためのリポジトリクローン/チェックアウトを実装。
  - [ ] 分析結果に基づいて Org Mode レポートの構造と内容を改善。
`;
}

/**
 * レポート内容をファイルに書き込む (Result 型を使用)。
 *
 * @param reportContent 書き込むレポート文字列。
 * @param projectRoot プロジェクトのルートディレクトリパス。
 * @returns 書き込まれたファイルの絶対パスまたはエラーを含む Promise<Result>。
 */
const writeReportToFile = async (reportContent: string, projectRoot: string): Promise<Result<string, PrReviewError>> => {
  const filename = generateReportFilename();
  const outputDirPath = path.join(projectRoot, OUTPUT_DIR);
  const outputPath = path.join(outputDirPath, filename);

  try {
    await fs.mkdir(outputDirPath, { recursive: true }); // 出力ディレクトリを作成 (存在してもOK)
    await fs.writeFile(outputPath, reportContent);
    console.log(`レポートが正常に生成されました: ${outputPath}`);
    return ok(outputPath); // 成功時はフルパスを返す
  } catch (error) {
    console.error("レポートファイルの書き込みエラー:", error);
    return err({ type: "FileWriteError", message: `レポートファイルの書き込みに失敗しました: ${outputPath}`, error });
  }
}

/**
 * PR レビューツールを実行し、Org Mode レポートを生成する。
 * @param context ツール実行コンテキスト (prUrl を含む)。
 * @returns レポートファイルへの絶対パスを含むオブジェクト。
 * @throws GITHUB_TOKEN がない場合や API/ファイル書き込みエラー時に例外をスロー。
 */
const executePrReview = async ({ context }: { context: { prUrl: string } }): Promise<{ reportPath: string }> => {
  const githubToken = process.env.GITHUB_TOKEN;
  // GITHUB_TOKEN がなければ早期リターン (エラー送出)
  if (!githubToken) {
    const error: PrReviewError = { type: "MissingToken", message: "環境変数 GITHUB_TOKEN が設定されていません。" };
    console.error(`ツール実行失敗: ${error.message}`);
    // エージェントフレームワークに失敗を通知するためにエラーをスロー
    throw new Error(error.message);
  }

  const projectRoot = process.cwd();
  const octokit = new Octokit({ auth: githubToken });

  // --- Chain of operations using Result ---
  const result = await parsePrUrl(context.prUrl)
    .asyncAndThen(async (parts) => {
      console.log(`Fetching details for PR: ${parts.owner}/${parts.repo}#${parts.pull_number}`);
      const detailsResult = await getPrDetails(octokit, parts);
      const filesResult = await getPrFiles(octokit, parts);
      const diffResult = await getPrDiff(octokit, parts);

      // 結果を結合 - すべてのフェッチが成功した場合のみ続行
      return Result.combine([detailsResult, filesResult, diffResult]).mapErr((errors) => {
        // 必要であれば個々のエラーをログ記録し、簡潔さのために最初のエラーを返す
        const firstError = errors[0];
        console.error(`GitHub API エラー: ${firstError.message}`, firstError.error || "");
        return firstError; // 最初に発生したエラーを伝播させる
      });
    })
    .map(([prDetails, prFiles, prDiff]) => {
      console.log("Org Mode レポートを生成中...");
      return generateOrgReport(prDetails, prFiles, prDiff);
    })
    .asyncAndThen(async (reportContent) => {
      return writeReportToFile(reportContent, projectRoot);
    });
  // --- End Chain ---

  // エラーが発生した場合
  if (result.isErr()) {
    const error = result.error;
    console.error(`ツール実行失敗: [${error.type}] ${error.message}`, error.error || "");
    // エージェントフレームワークでキャッチされるようにエラーメッセージをスロー
    throw new Error(`[${error.type}] ${error.message}`);
  }

  // 成功した場合、レポートパスを返す
  console.log(`ツール実行成功。レポート: ${result.value}`);
  return { reportPath: result.value };
};


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
  execute: executePrReview, // 抽出した関数を呼び出す
});
