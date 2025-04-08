import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrDetails, PrFileInfo } from "../types";

const OUTPUT_DIR = ".output"; // レポート出力ディレクトリ

/**
 * レポート用のタイムスタンプ付きファイル名を生成する。 */
/**
 * @returns 生成されたファイル名 (例: "20230101120000_pull_request.org")。
 */
export const generateReportFilename = (): string => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.]/g, "").slice(0, 14); // YYYYMMDDHHMMSS
  return `${timestamp}_pull_request.org`;
};

/**
 * Org Mode 形式のレビューレポートを生成する。
 * (静的解析とテスト結果は現時点ではプレースホルダー)
 *
 * @param prDetails PR 詳細情報。
 * @param files 変更されたファイルの情報配列。
 * @param diff PR の差分文字列。
 * @returns 生成された Org Mode レポート文字列。
 */
export const generateOrgReport = (prDetails: PrDetails, files: PrFileInfo[], diff: string): string => {
  const reportDate = new Date().toISOString();
  const fileSummary = files.map((f) => `- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`).join("\n");
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
};

/**
 * レポート内容をファイルに書き込む。
 */
export const writeReportToFile = async (reportContent: string): Promise<string> => {
  const projectRoot = process.cwd();
  const filename = generateReportFilename();
  const outputPath = path.join(projectRoot, OUTPUT_DIR, filename);

  try {
    await mkdir(OUTPUT_DIR, { recursive: true }); // 出力ディレクトリを作成 (存在してもOK)
    await writeFile(outputPath, reportContent);
    console.log(`レポートが正常に生成されました: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("レポートファイルの書き込みエラー:", error);
    throw new Error("レポートファイルの書き込みに失敗しました。");
  }
};
