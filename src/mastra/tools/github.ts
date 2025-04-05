import { tool } from '@ai-sdk/react';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';

// Initialize Octokit
// Ensure GITHUB_TOKEN environment variable is set for authentication
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Helper function to parse owner and repo from repository string
const parseRepoString = (repoString: string): { owner: string; repo: string } => {
  const parts = repoString.split('/');
  if (parts.length !== 2) {
    throw new Error(`Invalid repository format: ${repoString}. Expected "owner/repo".`);
  }
  return { owner: parts[0], repo: parts[1] };
};

export const githubTools = {
  /**
   * Fetches details for a specific pull request.
   */
  getPullRequestDetails: tool({
    description: 'Get details of a GitHub pull request, like title, description, author, and branches.',
    parameters: z.object({
      repository: z.string().describe('The owner and repository name (e.g., "owner/repo")'),
      pullRequestNumber: z.number().describe('The number of the pull request'),
    }),
    execute: async ({ repository, pullRequestNumber }) => {
      if (!process.env.GITHUB_TOKEN) {
        console.warn('GITHUB_TOKEN environment variable is not set. GitHub API calls will likely fail.');
        // Optionally throw an error or return a specific message
        // throw new Error('GitHub token not configured.');
      }
      try {
        const { owner, repo } = parseRepoString(repository);
        console.log(`Fetching details for PR #${pullRequestNumber} in ${owner}/${repo}`);
        const { data } = await octokit.pulls.get({
          owner,
          repo,
          pull_number: pullRequestNumber,
        });
        return {
          title: data.title,
          description: data.body || 'No description provided.', // Handle null description
          author: data.user?.login || 'Unknown author', // Handle potential null user
          baseBranch: data.base.ref,
          headBranch: data.head.ref,
        };
      } catch (error) {
        console.error(`Error fetching PR details for ${repository}#${pullRequestNumber}:`, error);
        // Re-throw or return a structured error object
        throw new Error(`Failed to fetch details for PR ${repository}#${pullRequestNumber}. ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  }),

  /**
   * Fetches the diff for a specific pull request.
   */
  getPullRequestDiff: tool({
    description: 'Get the code changes (diff) for a GitHub pull request.',
    parameters: z.object({
      repository: z.string().describe('The owner and repository name (e.g., "owner/repo")'),
      pullRequestNumber: z.number().describe('The number of the pull request'),
    }),
    execute: async ({ repository, pullRequestNumber }) => {
       if (!process.env.GITHUB_TOKEN) {
        console.warn('GITHUB_TOKEN environment variable is not set. GitHub API calls will likely fail.');
        // Optionally throw an error or return a specific message
        // throw new Error('GitHub token not configured.');
      }
      try {
        const { owner, repo } = parseRepoString(repository);
        console.log(`Fetching diff for PR #${pullRequestNumber} in ${owner}/${repo}`);
        const { data } = await octokit.pulls.get({
          owner,
          repo,
          pull_number: pullRequestNumber,
          mediaType: {
            format: 'diff', // Request the diff format
          },
        });
        // The diff content is returned directly in the data field for this media type
        return data as string;
      } catch (error) {
        console.error(`Error fetching PR diff for ${repository}#${pullRequestNumber}:`, error);
        // Re-throw or return a structured error object
        throw new Error(`Failed to fetch diff for PR ${repository}#${pullRequestNumber}. ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  }),
};
