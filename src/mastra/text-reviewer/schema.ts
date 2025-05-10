import { z } from "zod";

export const workflowInputSchema = z.object({
  url: z.string().url().describe("GitHub Pull Request URL"),
});
