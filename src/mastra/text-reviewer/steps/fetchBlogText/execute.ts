import { WorkflowContext } from "@mastra/core";
import { Readability } from "@mozilla/readability";

export const execute = async (context: WorkflowContext): Promise<string> => {
  const url = context.triggerData?.inputSchema.url;

  return url;
};
