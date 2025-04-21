# ADR Reviewer Agent (`adrReviewerAgent`)

## Overview

The `adrReviewerAgent` is designed to review Architecture Decision Records (ADRs) based on a provided URL. It analyzes the content of the ADR against common best practices and provides feedback for improvement.

This agent helps ensure that ADRs are clear, well-justified, and consider potential consequences, thereby improving the quality of architectural decisions and documentation within a project.

## Functionality

The agent performs the following steps (currently placeholder logic):

1.  Accepts the URL of an ADR as input.
2.  (Future Implementation) Fetches the content of the ADR from the given URL.
3.  (Future Implementation) Analyzes the ADR content based on predefined criteria (e.g., presence and clarity of context, decision drivers, proposed solution, consequences).
4.  Returns a structured review including a summary, specific suggestions, and an overall assessment.

## Input

The agent expects input conforming to the `AdrReviewerInputSchema`:

```typescript
import { z } from "zod";

export const AdrReviewerInputSchema = z.object({
  adrUrl: z.string().url({ message: "Invalid URL provided for ADR." }),
  // TODO: Potentially add options for review criteria, specific sections to focus on, etc.
});

export type AdrReviewerInput = z.infer<typeof AdrReviewerInputSchema>;
```

-   `adrUrl`: (string, required) The URL pointing to the ADR document that needs to be reviewed.

## Output

The agent returns output conforming to the `AdrReviewerOutputSchema`:

```typescript
import { z } from "zod";

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

export type AdrReviewerOutput = z.infer<typeof AdrReviewerOutputSchema>;

```

-   `summary`: A brief summary of the reviewed ADR.
-   `suggestions`: An array of objects, each containing:
    -   `area`: The section of the ADR the suggestion relates to (e.g., "Context", "Decision").
    -   `suggestion`: The specific feedback or recommendation.
    -   `severity`: (Optional) The suggested severity ("High", "Medium", "Low").
-   `overallAssessment`: A concluding statement on the ADR's quality.

## Usage Example (Conceptual)

```typescript
import { mastra } from "./path/to/mastra/instance"; // Adjust the import path

async function reviewMyAdr() {
  try {
    const reviewResult = await mastra.run("adrReviewerAgent", {
      adrUrl: "https://example.com/path/to/my-adr-001.md",
    });

    console.log("ADR Review Summary:", reviewResult.summary);
    console.log("Suggestions:");
    reviewResult.suggestions.forEach(s => {
      console.log(`- [${s.area}] (${s.severity || 'N/A'}): ${s.suggestion}`);
    });
    console.log("Overall Assessment:", reviewResult.overallAssessment);

  } catch (error) {
    console.error("Error reviewing ADR:", error);
  }
}

reviewMyAdr();
```

## Future Enhancements

-   Implement actual fetching and parsing of ADR content from various formats (Markdown, Confluence, etc.).
-   Develop sophisticated analysis logic based on configurable ADR templates and quality criteria.
-   Integrate tools for specific checks (e.g., link validation, checking for required sections).
-   Allow customization of review criteria through input parameters.
