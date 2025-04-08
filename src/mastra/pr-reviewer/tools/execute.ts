import { Octokit } from "@octokit/rest";
import { parsePrUrl } from "../utils/parse";
import { getPrDetails, getPrDiff, getPrFiles } from "../utils/fetcher";
import { generateOrgReport, writeReportToFile } from "../utils/output";

/**
 * PR レビューツールを実行し、Org Mode レポートを生成する。
 *
 * @param context ツール実行コンテキスト (prUrl を含む)。
 * @returns レポートファイルへの絶対パスを含むオブジェクト。
 * @throws GITHUB_TOKEN がない場合や API/ファイル書き込みエラー時に例外をスロー。
 */
export const executePrReview = async (prUrl: string): Promise<{ reportPath: string }> => {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error("ツール実行失敗: 環境変数 GITHUB_TOKEN が設定されていません。");
    throw new Error("[MissingToken] 環境変数 GITHUB_TOKEN が設定されていません。");
  }

  const octokit = new Octokit({ auth: githubToken });

  try {
    const parts = parsePrUrl(prUrl);
    console.log(`Fetching details for PR: ${parts.owner}/${parts.repo}#${parts.pull_number}`);

    const prDetails = await getPrDetails(octokit, parts);
    const prFiles = await getPrFiles(octokit, parts);
    const prDiff = await getPrDiff(octokit, parts);

    console.log("Org Mode レポートを生成中...");
    const reportContent = generateOrgReport(prDetails, prFiles, prDiff);

    const reportPath = await writeReportToFile(reportContent);
    console.log(`ツール実行成功。レポート: ${reportPath}`);
    return { reportPath };
  } catch (error) {
    console.error("ツール実行中にエラーが発生しました:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        `[ToolExecutionError] PR レビューツールの実行中に予期しないエラーが発生しました: ${String(error)}`,
      );
    }
  }
};
