// @ts-expect-error — octokit not installed; install via npm install octokit
import { Octokit } from "octokit";
import type { GitHubProfile, GitHubRepo } from "@/types";

let _octokit: Octokit | null = null;

function getOctokit() {
  if (!_octokit) {
    _octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  }
  return _octokit;
}

function mapRepo(r: {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
}): GitHubRepo {
  return {
    name: r.name,
    fullName: r.full_name,
    description: r.description ?? "",
    url: r.html_url,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language ?? "",
    topics: r.topics ?? [],
    isPinned: false,
    updatedAt: r.updated_at,
  };
}

export async function fetchProfileWithOctokit(username: string): Promise<GitHubProfile> {
  const octokit = getOctokit();

  const { data: user } = await octokit.rest.users.getByUsername({ username });

  const { data: repos } = await octokit.rest.repos.listForUser({
    username,
    per_page: 100,
    sort: "updated",
    direction: "desc",
    type: "owner",
  });

  const languages: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] ?? 0) + 1;
    }
  }

  const sorted = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
  const pinnedRepos = sorted.slice(0, 6).map((r) => mapRepo(r as any));

  return {
    username,
    name: user.name ?? username,
    bio: user.bio ?? "",
    avatar: user.avatar_url ?? "",
    repos: repos.map((r: any) => mapRepo(r as any)),
    totalStars: repos.reduce((s: any, r: any) => s + r.stargazers_count, 0),
    totalForks: repos.reduce((s: any, r: any) => s + r.forks_count, 0),
    languages,
    pinnedRepos,
    contributions: user.public_repos,
  };
}
