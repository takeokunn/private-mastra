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
  status: string; // "added", "modified", "removed", etc.
  changes: number;
  additions: number;
  deletions: number;
};
