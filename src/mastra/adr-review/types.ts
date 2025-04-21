import { z } from "zod";

// Define the input schema for the ADR reviewer agent
export const AdrReviewerInputSchema = z.object({
  adrUrl: z.string().url({ message: "Invalid URL provided for ADR." }),
  // TODO: Potentially add options for review criteria, specific sections to focus on, etc.
});

// Define the output schema for the ADR reviewer agent
export const AdrReviewerOutputSchema = z.object({
  summary: z.string().describe("A brief summary of the ADR."),
  suggestions: z
    .array(
      z.object({
        area: z.string().describe("The area of the ADR the suggestion applies to (e.g., Context, Decision, Consequences)."),
        suggestion: z.string().describe("The specific suggestion for improvement."),
        severity: z.enum(["High", "Medium", "Low"]).optional().describe("Optional severity level of the suggestion."),
      }),
    )
    .describe("A list of suggestions for improving the ADR."),
  overallAssessment: z.string().describe("An overall assessment of the ADR's quality."),
  // TODO: Add more detailed analysis fields if needed
});

// Infer the TypeScript types from the Zod schemas
export type AdrReviewerInput = z.infer<typeof AdrReviewerInputSchema>;
export type AdrReviewerOutput = z.infer<typeof AdrReviewerOutputSchema>;
