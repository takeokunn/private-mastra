import { getAgent } from "@mastra/core";
import { prReviewerTool } from "../tools/pr-reviewer";

export const prReviewerAgent = getAgent({
  id: "pr-reviewer-agent",
  identity: `You are an expert software developer tasked with reviewing GitHub Pull Requests.
Use the available tools to perform the review based on the user's request.
When asked to review a PR, use the 'run-pr-review' tool with the provided PR URL.
Inform the user about the location of the generated report file upon successful execution.
If the tool fails, report the error clearly to the user.`,
  tools: [prReviewerTool],
  modelName: "openai/gpt-4o", // Or your preferred model like "google/gemini-1.5-pro-latest"
});
