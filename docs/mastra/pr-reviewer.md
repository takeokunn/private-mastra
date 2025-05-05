# Mastra PR Reviewer Documentation

This document provides an overview of the `pr-reviewer` module within the Mastra project. This module is designed to automatically review GitHub Pull Requests using AI agents.

## Overview

The `pr-reviewer` module defines a workflow (`reviewPullRequestWorkflow`) that orchestrates several steps to fetch pull request data, perform reviews based on different aspects (like code quality, security, performance), and generate a report summarizing the findings.

## Core Components

### 1. Entry Point (`src/mastra/pr-reviewer/index.ts`)

This file serves as the main entry point for the `pr-reviewer` module, exporting the primary workflow and related types.

-   **Exports**:
    -   `reviewPullRequestWorkflow`: The main workflow function.
    -   Types and schemas related to the workflow input and output.

### 2. Workflows (`src/mastra/pr-reviewer/workflows.ts`)

Defines the main workflow for reviewing pull requests.

-   **`reviewPullRequestWorkflow`**:
    -   Takes a GitHub Pull Request URL as input.
    -   Orchestrates the execution of the defined steps: `fetchPullRequest`, `reviewAgent`, and `generateReport`.
    -   Uses Zod schemas (`reviewPullRequestInputSchema`, `reviewPullRequestOutputSchema`) for input validation and defining the output structure.

### 3. Workflow Steps (`src/mastra/pr-reviewer/steps/`)

The workflow is composed of distinct steps, each responsible for a specific part of the review process.

#### a. `fetchPullRequest`

-   **Purpose**: Fetches details, files, and diff information for a given Pull Request URL.
-   **Directory**: `src/mastra/pr-reviewer/steps/fetchPullRequest/`
-   **Key Files**:
    -   `index.ts`: Defines the step using `createStep`.
    -   `execute.ts`: Contains the main execution logic for the step. It parses the URL and uses the fetcher utility.
    -   `utils/parse.ts`: Utility functions to parse GitHub Pull Request URLs (`parsePullRequestUrl`).
    -   `utils/fetcher.ts`: Utility functions (`fetchPullRequestDetails`, `fetchPullRequestFiles`, `fetchPullRequestDiff`) to interact with the GitHub API (using Octokit) to retrieve PR data.

#### b. `reviewAgent`

-   **Purpose**: Performs the actual review of the pull request diff using an AI agent based on specified instructions.
-   **Directory**: `src/mastra/pr-reviewer/steps/reviewAgent/`
-   **Key Files**:
    -   `index.ts`: Defines the step using `createStep`.
    -   `execute.ts`: Contains the main execution logic. It iterates through different review types (summary, architecture, code quality, etc.), prepares prompts using instructions, invokes the AI agent, and optionally posts comments to GitHub.
    -   `instructions/`: Contains specific instructions for the AI agent for each review aspect (e.g., `basic.ts`, `security.ts`, `performance.ts`). `index.ts` exports all instructions.
    -   `integrations/github.ts`: Utility function (`postReviewComment`) to post the generated review comments back to the GitHub Pull Request.

#### c. `generateReport`

-   **Purpose**: Generates a final report summarizing the reviews from the `reviewAgent` step.
-   **Directory**: `src/mastra/pr-reviewer/steps/generateReport/`
-   **Key Files**:
    -   `index.ts`: Defines the step using `createStep`.
    -   `execute.ts`: Contains the main execution logic. It uses the `generateReportAgent` to synthesize the reviews into a report and saves it using the output utility.
    -   `agent.ts`: Defines the AI agent (`generateReportAgent`) specifically configured to generate the final report based on the collected reviews.
    -   `utils/template.ts`: Provides template functions (`getReportTemplate`) to structure the final report content.
    -   `utils/output.ts`: Utility function (`saveReport`) to save the generated report to a Markdown file.

### 4. Data Types (`src/mastra/pr-reviewer/types.ts`)

This file defines the core TypeScript types used throughout the `pr-reviewer` module.

-   **Key Types**:
    -   `PullRequestUrlParts`: Structure for parsed PR URL components.
    -   `PullRequestDetails`: Detailed information about the PR (title, body, SHAs, etc.).
    -   `PullRequestFileInfo`: Information about files changed in the PR.
    -   `PullRequest`: Aggregated type containing parts, details, files, and diff.
    -   `ReviewResponse`: Structure for the output of a single review aspect.
    -   `GenerateReportResponse`: Structure for the output of the report generation step (path to the report).
    -   `ReviewType`: Enum-like type defining the different review aspects (summary, architecture, etc.).

### 5. Schemas (`src/mastra/pr-reviewer/schema.ts`)

Defines Zod schemas for validating inputs and outputs of the workflow and its steps.

-   **Key Schemas**:
    -   `PullRequestUrlPartsSchema`: Schema for `PullRequestUrlParts`.
    -   `PullRequestDetailsSchema`: Schema for `PullRequestDetails`.
    -   `PullRequestFileInfoSchema`: Schema for `PullRequestFileInfo`.
    -   `PullRequestSchema`: Schema for `PullRequest`.
    -   `ReviewResponseSchema`: Schema for `ReviewResponse`.
    -   `GenerateReportResponseSchema`: Schema for `GenerateReportResponse`.
    -   `reviewPullRequestInputSchema`: Input schema for the main workflow.
    -   `reviewPullRequestOutputSchema`: Output schema for the main workflow.

### 6. Constants (`src/mastra/pr-reviewer/const.ts`)

Contains constant values used within the module.

-   **`REVIEW_TYPES`**: An array listing all the defined `ReviewType` values used in the `reviewAgent` step.

## How it Works

1.  The `reviewPullRequestWorkflow` receives a GitHub PR URL.
2.  The `fetchPullRequest` step parses the URL and fetches PR details, changed files, and the diff from GitHub.
3.  The `reviewAgent` step iterates through each `ReviewType` defined in `REVIEW_TYPES`. For each type:
    -   It constructs a prompt using the corresponding instructions from the `instructions/` directory and the fetched PR data (diff).
    -   It invokes an AI agent with the prompt to get a review for that specific aspect.
    -   Optionally, it posts the review as a comment on the GitHub PR using `integrations/github.ts`.
4.  The `generateReport` step takes all the individual reviews generated by `reviewAgent`.
    -   It uses another AI agent (`generateReportAgent`) and a template (`utils/template.ts`) to create a consolidated Markdown report.
    -   It saves the report to a file using `utils/output.ts`.
5.  The workflow returns the path to the generated report.
