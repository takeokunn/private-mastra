import { createTool } from "@mastra/core/tools";
import { Octokit } from "@octokit/rest";
import { Result, err, ok, fromPromise } from "neverthrow";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

// --- Constants ---
const OUTPUT_DIR = ".output";

// --- Types ---
interface PrUrlParts {
  owner: string;
  repo: string;
  pull_number: number;
}

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

type PrReviewError =
  | { type: "InvalidUrl"; message: string }
  | { type: "GitHubApiError"; message: string; error?: unknown }
  | { type: "FileWriteError"; message: string; error?: unknown }
  | { type: "MissingToken"; message: string };

// --- Helper Functions ---

/**
 * Parses the GitHub PR URL to extract owner, repo, and pull number.
 */
const parsePrUrl = (prUrl: string): Result<PrUrlParts, PrReviewError> => {
  const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (match) {
    return ok({
      owner: match[1],
      repo: match[2],
      pull_number: parseInt(match[3], 10),
    });
  }
  return err({
    type: "InvalidUrl",
    message: "Invalid PR URL format. Expected format: https://github.com/owner/repo/pull/number",
  });
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
 * Fetches PR details from GitHub API using Result for error handling.
 */
function getPrDetails(octokit: Octokit, parts: PrUrlParts): Promise<Result<PrDetails, PrReviewError>> {
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
 * Fetches changed files list from GitHub API using Result.
 */
async function getPrFiles(octokit: Octokit, parts: PrUrlParts): Promise<Result<PrFileInfo[], PrReviewError>> {
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
 * Fetches PR diff from GitHub API using Result.
 */
async function getPrDiff(octokit: Octokit, parts: PrUrlParts): Promise<Result<string, PrReviewError>> {
  const promise = octokit.pulls.get({
    owner: parts.owner,
    repo: parts.repo,
    pull_number: parts.pull_number,
    mediaType: {
      format: "diff",
    },
  });

  // The type assertion is needed because the mediaType format changes the response type
  return fromPromise(promise, (error) => ({
    type: "GitHubApiError",
    message: `Failed to fetch PR diff for ${parts.owner}/${parts.repo}#${parts.pull_number}`,
    error,
  })).map((response) => response.data as unknown as string);
}

/**
 * Generates the review report in Org Mode format.
 * (Static analysis and test results are placeholders for now)
 */
function generateOrgReport(prDetails: PrDetails, files: PrFileInfo[], diff: string): string {
  const reportDate = new Date().toISOString();
  const fileSummary = files.map((f) => `- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`).join("\n");
  const staticAnalysisResult = "[Static Analysis Results Placeholder - Not Implemented]";
  const testResult = "[Test Results Placeholder - Not Implemented]";

  return `
#+TITLE: Pull Request Review: ${prDetails.title}
#+DATE: ${reportDate}
#+AUTHOR: AI Review Assistant (via prReviewerTool)
#+PROPERTY: PR_URL ${prDetails.html_url}
#+PROPERTY: REPO ${prDetails.owner}/${prDetails.repo}
#+PROPERTY: PR_NUMBER ${prDetails.pull_number}
#+PROPERTY: BASE_SHA ${prDetails.base_sha}
#+PROPERTY: HEAD_SHA ${prDetails.head_sha}

* Summary
  :PROPERTIES:
  :REVIEW_STATUS: NEEDS MANUAL REVIEW
  :END:
  This report contains basic information fetched from the PR. Further analysis (code quality, tests, etc.) requires manual review or integration of additional tools.

* PR Details
  - *Title*: ${prDetails.title}
  - *URL*: ${prDetails.html_url}
  - *Description*:
    ${prDetails.body || "No description provided."}

* Changes Overview
** Changed Files (${files.length})
${fileSummary || "No files changed or unable to fetch file list."}

** Diff Summary
   \`\`\`diff
   ${diff ? `${diff.substring(0, 1500)}... \n[Diff truncated for brevity]` : "Unable to fetch diff."}
   \`\`\`

* Analysis (Placeholders)
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
  - [X] Needs Manual Review / Further Action
  - [ ] Request Changes

  This automated report provides a starting point. Manual review is recommended.

* Next Steps (Tool Development)
  - [ ] Integrate static analysis tool execution (e.g., Biome).
  - [ ] Integrate test execution and coverage reporting (e.g., Vitest).
  - [ ] Implement repository cloning/checkout for deeper analysis.
  - [ ] Refine Org Mode report structure and content based on analysis results.
`;
}

/**
 * Writes the report content to a file using Result.
 */
async function writeReportToFile(reportContent: string, projectRoot: string): Promise<Result<string, PrReviewError>> {
  const filename = generateReportFilename();
  const outputDirPath = path.join(projectRoot, OUTPUT_DIR);
  const outputPath = path.join(outputDirPath, filename);

  try {
    await fs.mkdir(outputDirPath, { recursive: true });
    await fs.writeFile(outputPath, reportContent);
    console.log(`Report successfully generated: ${outputPath}`);
    return ok(outputPath); // Return the full path on success
  } catch (error) {
    console.error("Error writing report file:", error);
    return err({ type: "FileWriteError", message: `Failed to write report file to ${outputPath}`, error });
  }
}

// --- Tool Definition ---

export const prReviewerTool = createTool({
  id: "pr-reviewer", // Renamed from run-pr-review for clarity
  description:
    "Fetches GitHub Pull Request information (details, files, diff) and generates a basic Org Mode review report.",
  inputSchema: z.object({
    prUrl: z.string().url().describe("The full URL of the GitHub Pull Request"),
  }),
  outputSchema: z.object({
    reportPath: z.string().describe("The absolute path to the generated review report file"),
  }),
  execute: async ({ context }): Promise<{ reportPath: string }> => {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      // Use err and map to throw for tool execution context
      const error: PrReviewError = { type: "MissingToken", message: "GITHUB_TOKEN environment variable is not set." };
      console.error(`Tool execution failed: ${error.message}`);
      throw new Error(error.message); // Throw to signal failure to the agent framework
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

        // Combine results - proceed only if all fetches are successful
        return Result.combine([detailsResult, filesResult, diffResult]).mapErr((errors) => {
          // Log individual errors if needed, return the first one for simplicity
          const firstError = errors[0];
          console.error(`GitHub API Error: ${firstError.message}`, firstError.error || "");
          return firstError; // Propagate the first encountered error
        });
      })
      .map(([prDetails, prFiles, prDiff]) => {
        console.log("Generating Org Mode report...");
        return generateOrgReport(prDetails, prFiles, prDiff);
      })
      .asyncAndThen(async (reportContent) => {
        return writeReportToFile(reportContent, projectRoot);
      });
    // --- End Chain ---

    if (result.isErr()) {
      const error = result.error;
      console.error(`Tool execution failed: [${error.type}] ${error.message}`, error.error || "");
      // Throw the error message to be caught by the agent framework
      throw new Error(`[${error.type}] ${error.message}`);
    }

    // On success, return the report path
    console.log(`Tool execution successful. Report at: ${result.value}`);
    return { reportPath: result.value };
  },
});
