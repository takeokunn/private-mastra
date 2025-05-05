import { z } from "zod";

export const workflowInputSchema = z.object({
  url: z.string().url().describe("GitHub Pull Request URL"),
});

export const fetchPullRequestOutputSchema = z.object({
  parts: z.object({
    owner: z.string(),
    repo: z.string(),
    pull_number: z.number(),
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
    }),
  ),
  diff: z.string(),
});

export const reviewAgentOutputSchema = z.object({
  review: z.string(),
});

export const generateOutputSchema = z.object({
  path: z.string(),
});
