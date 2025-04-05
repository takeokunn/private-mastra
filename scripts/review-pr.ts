import { Octokit } from "@octokit/rest";
import { program } from "commander";
import dotenv from "dotenv";
import { execa } from "execa";
import fs from "fs/promises";
import path from "path";
import simpleGit, { SimpleGit } from "simple-git";

// .env ファイルから環境変数を読み込む
dotenv.config();

// --- 型定義 ---

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

// --- 定数 ---
const OUTPUT_DIR = ".claude/output"; // レポート出力ディレクトリ
const TEMP_CLONE_DIR = ".claude/temp_repo"; // 一時クローンディレクトリ

// --- ヘルパー関数 ---

/**
 * GitHub PR URL を解析し、owner, repo, pull number を抽出する。
 */
const parsePrUrl = (prUrl: string): { owner: string; repo: string; pull_number: number } | null => {
  const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  // マッチしない場合は早期リターン
  if (!match) {
    return null;
  }
  // マッチした場合
  return {
    owner: match[1],
    repo: match[2],
    pull_number: parseInt(match[3], 10),
  };
};

/**
 * レポート用のタイムスタンプ付きファイル名を生成する。
 */
const generateReportFilename = (): string => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.]/g, "").slice(0, 14); // YYYYMMDDHHMMSS
  return `${timestamp}_pull_request.org`;
}

/**
 * GitHub API から PR 詳細を取得する。
 */
const getPrDetails = async (octokit: Octokit, owner: string, repo: string, pull_number: number): Promise<PrDetails> => {
  try {
    const { data: prData } = await octokit.pulls.get({
      owner,
      repo,
      pull_number,
    });
    return {
      owner,
      repo,
      pull_number,
      title: prData.title,
      body: prData.body,
      html_url: prData.html_url,
      base_sha: prData.base.sha,
      head_sha: prData.head.sha,
    };
  } catch (error) {
    console.error("Error fetching PR details:", error);
    throw new Error("Failed to fetch PR details.");
  }
}

/**
 * GitHub API から変更されたファイルリストを取得する。
 */
const getPrFiles = async (octokit: Octokit, owner: string, repo: string, pull_number: number): Promise<PrFileInfo[]> => {
    try {
        const { data: filesData } = await octokit.pulls.listFiles({
            owner,
            repo,
            pull_number,
        });
        return filesData.map(file => ({
            filename: file.filename,
            status: file.status,
            changes: file.changes,
            additions: file.additions,
            deletions: file.deletions,
        }));
    } catch (error) {
        console.error("Error fetching PR files:", error);
        throw new Error("Failed to fetch PR files.");
    }
}

/**
 * GitHub API から PR の差分 (diff) を取得する。
 */
const getPrDiff = async (octokit: Octokit, owner: string, repo: string, pull_number: number): Promise<string> => {
    try {
        const { data: diffData } = await octokit.pulls.get({
            owner,
            repo,
            pull_number,
            mediaType: {
                format: "diff",
            },
        });
        // mediaType format がレスポンス型を変更するため、型アサーションが必要
        return diffData as unknown as string;
    } catch (error) {
        console.error("PR diff の取得エラー:", error);
        throw new Error("Failed to fetch PR diff.");
    }
}


/**
 * リポジトリをクローンし、PR ブランチをチェックアウトする (プレースホルダー)。
 * TODO: 実際の git 操作を実装する。
 */
const setupRepository = async (repoUrl: string, baseSha: string, headSha: string): Promise<SimpleGit> => {
  console.log(`[TODO] リポジトリ ${repoUrl} を ${TEMP_CLONE_DIR} にクローンします`);
  console.log(`[TODO] ベース SHA: ${baseSha} とヘッド SHA: ${headSha} をチェックアウトします`);
  // プレースホルダー: 実際の開発では simple-git や execa を使用
  // await fs.rm(TEMP_CLONE_DIR, { recursive: true, force: true }); // 既存ディレクトリ削除
  // await fs.mkdir(TEMP_CLONE_DIR, { recursive: true }); // ディレクトリ作成
  // const git: SimpleGit = simpleGit(TEMP_CLONE_DIR);
  // await git.clone(repoUrl, ".");
  // await git.checkout(baseSha); // または PR ref をフェッチ
  // await git.checkout(headSha);
  // return git;
  return simpleGit(); // 現時点ではダミーの git インスタンスを返す
};

/**
 * 静的解析を実行する (プレースホルダー)。
 * TODO: biome check/lint の実行を実装する。
 */
const runStaticAnalysis = async (repoPath: string): Promise<string> => {
  console.log(`[TODO] 静的解析 (例: biome check) を ${repoPath} で実行します`);
  // プレースホルダー: 実際の開発では execa を使用
  // try {
  //   const { stdout } = await execa("biome", ["check", "--apply", "."], { cwd: repoPath }); // biome コマンド実行
  //   return stdout; // 結果を返す
  // } catch (error) {
  //   console.warn("静的解析コマンド失敗:", error);
  //   return `静的解析の実行エラー: ${error.stderr || error.message}`;
  // }
  return "[静的解析結果プレースホルダー]";
};

/**
 * テストを実行する (プレースホルダー)。
 * TODO: テスト実行 (例: npm run test) を実装する。
 */
const runTests = async (repoPath: string): Promise<string> => {
  console.log(`[TODO] テスト (例: npm run test) を ${repoPath} で実行します`);
  // プレースホルダー: 実際の開発では execa を使用
  // try {
  //   const { stdout } = await execa("npm", ["run", "test"], { cwd: repoPath }); // 必要に応じてコマンド調整
  //   return stdout; // 結果を返す
  // } catch (error) {
  //   console.warn("テストコマンド失敗:", error);
  //   return `テストの実行エラー: ${error.stderr || error.message}`;
  // }
  return "[テスト結果プレースホルダー]";
};

/**
 * Org Mode 形式のレビューレポートを生成する。
 */
const generateOrgReport = (prDetails: PrDetails, files: PrFileInfo[], diff: string, staticAnalysisResult: string, testResult: string): string => {
  const reportDate = new Date().toISOString();
  const fileSummary = files.map(f => `- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`).join("\n");

  return `
#+TITLE: Pull Request Review: ${prDetails.title}
#+DATE: ${reportDate}
#+AUTHOR: AI Review Assistant
#+PROPERTY: PR_URL ${prDetails.html_url}
#+PROPERTY: REPO ${prDetails.owner}/${prDetails.repo}
#+PROPERTY: PR_NUMBER ${prDetails.pull_number}
#+PROPERTY: BASE_SHA ${prDetails.base_sha}
#+PROPERTY: HEAD_SHA ${prDetails.head_sha}

* Summary
  :PROPERTIES:
  :REVIEW_STATUS: NEEDS REVISION
  :END:
  [TODO: Provide a high-level summary of the review findings.]

* PR Details
  - *Title*: ${prDetails.title}
  - *URL*: ${prDetails.html_url}
  - *Description*:
    ${prDetails.body || "No description provided."}

* Changes Overview
** Changed Files (${files.length})
${fileSummary}

** Diff Summary
   \`\`\`diff
   ${diff.substring(0, 1000)}... 
   [Diff truncated for brevity]
   \`\`\`
   [TODO: Add more detailed diff analysis if needed]

* Analysis
** Code Quality & Standards
   - *Static Analysis*:
     \`\`\`
     ${staticAnalysisResult}
     \`\`\`
   - *Adherence to \`docs/rules.md\`*: [TODO: Analyze adherence to coding standards]
   - *Readability & Maintainability*: [TODO: Assess code readability]

** Functionality & Logic
   - *Test Results*:
     \`\`\`
     ${testResult}
     \`\`\`
   - *Coverage*: [TODO: Extract and report test coverage]
   - *Logic Review*: [TODO: Analyze core logic changes]
   - *Edge Cases*: [TODO: Consider potential edge cases]

** Documentation & Comments
   - *TSDoc/Comments*: [TODO: Check for adequate documentation]
   - *Related \`docs/domain.md\` Updates*: [TODO: Check if domain docs need updates]

* Recommendations
  - [ ] Approve
  - [X] Needs Revision
  - [ ] Request Changes

  [TODO: List specific recommendations for improvement.]

* Next Steps
  - [ ] Implement detailed code analysis logic.
  - [ ] Integrate actual static analysis tool execution (Biome).
  - [ ] Integrate actual test execution and coverage reporting (Vitest).
  - [ ] Implement repository cloning and checkout.
  - [ ] Refine Org Mode report structure and content.
`;
}

/**
 * レポート内容をファイルに書き込む。
 */
const writeReportToFile = async (reportContent: string): Promise<void> => {
  const filename = generateReportFilename();
  const outputPath = path.join(OUTPUT_DIR, filename);

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true }); // 出力ディレクトリを作成 (存在してもOK)
    await fs.writeFile(outputPath, reportContent);
    console.log(`レポートが正常に生成されました: ${outputPath}`);
  } catch (error) {
    console.error("レポートファイルの書き込みエラー:", error);
    throw new Error("レポートファイルの書き込みに失敗しました。");
  }
}


// --- メイン実行 ---

const main = async () => {
  program
    .name("pr-reviewer")
    .description("Analyzes a GitHub PR and generates an Org Mode review report.")
    .requiredOption("--pr-url <url>", "URL of the GitHub Pull Request")
    .parse(process.argv);

  const options = program.opts();
  const prUrl = options.prUrl;

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error("Error: GITHUB_TOKEN environment variable is not set.");
    process.exit(1);
  }

  const prUrlParts = parsePrUrl(prUrl);
  if (!prUrlParts) {
    console.error("Error: Invalid PR URL format. Expected format: https://github.com/owner/repo/pull/number");
    process.exit(1);
  }

  const { owner, repo, pull_number } = prUrlParts;

  const octokit = new Octokit({ auth: githubToken });

  try {
    console.log(`Fetching details for PR: ${owner}/${repo}#${pull_number}`);
    const prDetails = await getPrDetails(octokit, owner, repo, pull_number);
    const prFiles = await getPrFiles(octokit, owner, repo, pull_number);
    const prDiff = await getPrDiff(octokit, owner, repo, pull_number);

    // --- 高度なステップのプレースホルダー ---
    // const repoUrl = `https://github.com/${owner}/${repo}.git`;
    // const git = await setupRepository(repoUrl, prDetails.base_sha, prDetails.head_sha);
    const repoPath = TEMP_CLONE_DIR; // クローン実装後にこのパスを使用
    const staticAnalysisResult = await runStaticAnalysis(repoPath);
    const testResult = await runTests(repoPath);
    // --- プレースホルダー終了 ---

    console.log("Org Mode レポートを生成中...");
    const reportContent = generateOrgReport(prDetails, prFiles, prDiff, staticAnalysisResult, testResult);

    await writeReportToFile(reportContent);

    // TODO: 実装した場合、一時クローンディレクトリをクリーンアップする
    // await fs.rm(TEMP_CLONE_DIR, { recursive: true, force: true });

  } catch (error) {
    console.error("スクリプト失敗:", error.message || error);
    process.exit(1);
  }
};

main();
