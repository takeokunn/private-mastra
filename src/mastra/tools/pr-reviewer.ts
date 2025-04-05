import { createTool } from "@mastra/core/tools";
import { execa } from "execa";
import path from "path";
import { z } from "zod";

// Helper function to parse the report path from script output
const parseReportPath = (stdout: string): string | null => {
  // Look for the specific output line from scripts/review-pr.ts
  const match = stdout.match(/Report successfully generated: (.*)/);
  return match ? match[1].trim() : null; // Trim whitespace
};

export const prReviewerTool = createTool({
  id: "run-pr-review",
  description: "Runs the PR review script for a given GitHub Pull Request URL and returns the path to the generated Org Mode report.",
  inputSchema: z.object({
    prUrl: z.string().url().describe("The full URL of the GitHub Pull Request"),
  }),
  outputSchema: z.object({
    reportPath: z.string().describe("The absolute path to the generated review report file"),
  }),
  execute: async ({ context }) => {
    // Resolve the script path relative to the project root (where package.json is)
    const projectRoot = process.cwd();
    const scriptPath = path.resolve(projectRoot, "scripts/review-pr.ts");
    const nodeExecutable = process.execPath; // Path to the current Node.js executable

    if (!process.env.GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN environment variable is not set. This tool requires it to access GitHub API.");
    }

    try {
      console.log(`Executing PR review script: ${scriptPath} for: ${context.prUrl}`);
      // Execute using ts-node via the Node executable.
      // Pass GITHUB_TOKEN explicitly in the environment.
      const { stdout, stderr, exitCode, failed } = await execa(
        nodeExecutable,
        [
          "-r",
          "ts-node/register/transpile-only", // Use ts-node register hook
          scriptPath,
          "--pr-url",
          context.prUrl,
        ],
        {
          // Pass environment variables, ensuring GITHUB_TOKEN is included
          env: {
            ...process.env,
            GITHUB_TOKEN: process.env.GITHUB_TOKEN,
          },
          // Set the current working directory if needed, though process.cwd() should work
          // cwd: projectRoot,
          // Reject the promise only if the command fails in an unexpected way (e.g., command not found)
          // We'll check exitCode manually.
          reject: false,
        },
      );

      console.log("Script stdout:\n", stdout);
      if (stderr) {
        console.error("Script stderr:\n", stderr);
      }
      console.log(`Script finished with exit code: ${exitCode}`);

      // Check if the script execution itself failed (non-zero exit code)
      if (failed || exitCode !== 0) {
        throw new Error(`PR review script failed with exit code ${exitCode}. Stderr: ${stderr || "N/A"}`);
      }

      const reportPath = parseReportPath(stdout);

      if (!reportPath) {
        console.error("Failed to parse report path from script output:", stdout);
        throw new Error("Failed to determine the report path from the script execution output.");
      }

      const absoluteReportPath = path.resolve(projectRoot, reportPath);
      console.log(`Report generated at: ${absoluteReportPath}`);
      return { reportPath: absoluteReportPath };

    } catch (error: any) {
      console.error("Error executing or processing PR review script:", error);
      // Rethrow a cleaner error message
      throw new Error(`Failed to execute PR review script: ${error.message}`);
    }
  },
});
