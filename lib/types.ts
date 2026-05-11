export type LaunchCategory =
  | "agent"
  | "sdk"
  | "infra"
  | "template"
  | "tooling";

export type Launch = {
  id: string;
  title: string;
  tagline: string;
  url: string;
  description: string;
  category: LaunchCategory;
  builder: string;
  voteCount: number;
  createdAt: string;
};

export type VoteRecord = Record<string, string[]>;
