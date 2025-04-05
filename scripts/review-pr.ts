import { Octokit } from "@octokit/rest";
import { program } from "commander";
import dotenv from "dotenv";
import { execa } from "execa";
import fs from "fs/promises";
import path from "path";
import simpleGit, { SimpleGit } from "simple-git";

// Load environment variables from .env file
dotenv.config();

// --- Types ---

interface PrDetails {
  owner: string;
  repo: string;
  pull_number: number;
  title: string;
  body: string | null;
  html_url: string;
  base_sha: string;
  head_sha: string;
}

interface PrFileInfo {
  filename: string;
  status: string; // "added", "modified", "removed", etc.
  changes: number;
  additions: number;
  deletions: number;
}

// --- Constants ---
const OUTPUT_DIR = ".claude/output";
const TEMP_CLONE_DIR = ".claude/temp_repo";

// --- Helper Functions ---

/**
 * Parses the GitHub PR URL to extract owner, repo, and pull number.
 */
function parsePrUrl(prUrl: string): { owner: string; repo: string; pull_number: number } | null {
  const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (match) {
    return {
      owner: match[1],
      repo: match[2],
      pull_number: parseInt(match[3], 10),
    };
  }
  return null;
}

/**
 * Generates a timestamped filename for the report.
 */
function generateReportFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.]/g, "").slice(0, 14); // YYYYMMDDHHMMSS
  return `${timestamp}_pull_request.org`;
}

/**
 * Fetches PR details from GitHub API.
 */
async function getPrDetails(octokit: Octokit, owner: string, repo: string, pull_number: number): Promise<PrDetails> {
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
 * Fetches changed files list from GitHub API.
 */
async function getPrFiles(octokit: Octokit, owner: string, repo: string, pull_number: number): Promise<PrFileInfo[]> {
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
 * Fetches PR diff from GitHub API.
 */
async function getPrDiff(octokit: Octokit, owner: string, repo: string, pull_number: number): Promise<string> {
    try {
        const { data: diffData } = await octokit.pulls.get({
            owner,
            repo,
            pull_number,
            mediaType: {
                format: "diff",
            },
        });
        // The type assertion is needed because the mediaType format changes the response type
        return diffData as unknown as string;
    } catch (error) {
        console.error("Error fetching PR diff:", error);
        throw new Error("Failed to fetch PR diff.");
    }
}


/**
 * Clones the repository and checks out the PR branches (Placeholder).
 * TODO: Implement actual git operations.
 */
async function setupRepository(repoUrl: string, baseSha: string, headSha: string): Promise<SimpleGit> {
  console.log(`[TODO] Cloning repository ${repoUrl} to ${TEMP_CLONE_DIR}`);
  console.log(`[TODO] Checking out base SHA: ${baseSha} and head SHA: ${headSha}`);
  // Placeholder: In a real implementation, use simple-git or execa here
  // await fs.rm(TEMP_CLONE_DIR, { recursive: true, force: true });
  // await fs.mkdir(TEMP_CLONE_DIR, { recursive: true });
  // const git: SimpleGit = simpleGit(TEMP_CLONE_DIR);
  // await git.clone(repoUrl, ".");
  // await git.checkout(baseSha); // Or fetch PR refs
  // await git.checkout(headSha);
  // return git;
  return simpleGit(); // Return dummy git instance for now
}

/**
 * Runs static analysis (Placeholder).
 * TODO: Implement biome check/lint execution.
 */
async function runStaticAnalysis(repoPath: string): Promise<string> {
  console.log(`[TODO] Running static analysis (e.g., biome check) in ${repoPath}`);
  // Placeholder: In a real implementation, use execa
  // try {
  //   const { stdout } = await execa("biome", ["check", "--apply", "."], { cwd: repoPath });
  //   return stdout;
  // } catch (error) {
  //   console.warn("Static analysis command failed:", error);
  //   return `Error running static analysis: ${error.stderr || error.message}`;
  // }
  return "[Static Analysis Results Placeholder]";
}

/**
 * Runs tests (Placeholder).
 * TODO: Implement test execution (e.g., npm run test).
 */
async function runTests(repoPath: string): Promise<string> {
  console.log(`[TODO] Running tests (e.g., npm run test) in ${repoPath}`);
  // Placeholder: In a real implementation, use execa
  // try {
  //   const { stdout } = await execa("npm", ["run", "test"], { cwd: repoPath }); // Adjust command as needed
  //   return stdout;
  // } catch (error) {
  //   console.warn("Test command failed:", error);
  //   return `Error running tests: ${error.stderr || error.message}`;
  // }
  return "[Test Results Placeholder]";
}

/**
 * Generates the review report in Org Mode format.
 */
function generateOrgReport(prDetails: PrDetails, files: PrFileInfo[], diff: string, staticAnalysisResult: string, testResult: string): string {
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
 * Writes the report content to a file.
 */
async function writeReportToFile(reportContent: string): Promise<void> {
  const filename = generateReportFilename();
  const outputPath = path.join(OUTPUT_DIR, filename);

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputPath, reportContent);
    console.log(`Report successfully generated: ${outputPath}`);
  } catch (error) {
    console.error("Error writing report file:", error);
    throw new Error("Failed to write report file.");
  }
}


// --- Main Execution ---

async function main() {
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

    // --- Placeholders for advanced steps ---
    // const repoUrl = `https://github.com/${owner}/${repo}.git`;
    // const git = await setupRepository(repoUrl, prDetails.base_sha, prDetails.head_sha);
    const repoPath = TEMP_CLONE_DIR; // Use this path once cloning is implemented
    const staticAnalysisResult = await runStaticAnalysis(repoPath);
    const testResult = await runTests(repoPath);
    // --- End Placeholders ---

    console.log("Generating Org Mode report...");
    const reportContent = generateOrgReport(prDetails, prFiles, prDiff, staticAnalysisResult, testResult);

    await writeReportToFile(reportContent);

    // TODO: Clean up temporary clone directory if implemented
    // await fs.rm(TEMP_CLONE_DIR, { recursive: true, force: true });

  } catch (error) {
    console.error("Script failed:", error.message || error);
    process.exit(1);
  }
}

main();
