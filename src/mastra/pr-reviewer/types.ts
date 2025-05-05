export type PullRequestUrlParts = {
  owner: string;
  repo: string;
  pull_number: number;
};

export type PullRequestDetails = {
  owner: string;
  repo: string;
  pull_number: number;
  title: string;
  body: string | null;
  html_url: string;
  base_sha: string;
  head_sha: string;
};

export type PullRequestFileInfo = {
  filename: string;
  status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
  changes: number;
  additions: number;
  deletions: number;
};

export type PullRequest = {
  parts: PullRequestUrlParts;
  details: PullRequestDetails;
  files: PullRequestFileInfo[];
  diff: string;
};

export type ReviewResponse = {
  review: string;
};

export type GenerateReportResponse = {
  path: string;
};
