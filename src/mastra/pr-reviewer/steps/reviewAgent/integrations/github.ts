import { GithubIntegration } from "@mastra/github";
import { createTool } from "@mastra/core";
import { z } from "zod";

const github = new GithubIntegration({
  config: {
    PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN!,
  },
});

export const tool = createTool({
  id: "github-integration",
  description: "github-integration tool",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    ref: z.string(),
  }),
  execute: async ({ context }) => {
    const client = await github.getApiClient();

    const mainRef = await client.gitGetRef({
      path: {
        owner: context.owner,
        repo: context.repo,
        ref: context.ref,
      },
    });

    return { ref: mainRef.data?.ref };
  },
});
