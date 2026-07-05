import type { GitHubProfile, GitHubRepo } from "@/types";

export async function fetchGitHubProfile(username: string): Promise<GitHubProfile> {
  const res = await fetch(`https://api.github.com/users/${username}`);
  if (!res.ok) throw new Error("User not found");
  const user = await res.json();

  const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
  const repos: Array<{
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string;
    topics: string[];
    updated_at: string;
  }> = await reposRes.json();

  const languages: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] ?? 0) + 1;
    }
  }

  const sorted = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
  const pinnedRepos: GitHubRepo[] = sorted.slice(0, 6).map(mapRepo);

  return {
    username,
    name: user.name ?? username,
    bio: user.bio ?? "",
    avatar: user.avatar_url ?? "",
    repos: repos.map(mapRepo),
    totalStars: repos.reduce((s, r) => s + r.stargazers_count, 0),
    totalForks: repos.reduce((s, r) => s + r.forks_count, 0),
    languages,
    pinnedRepos,
    contributions: user.public_repos ?? 0,
  };
}

function mapRepo(r: {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
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

export function generateContributionBullets(profile: GitHubProfile): string[] {
  const bullets: string[] = [];

  if (profile.totalStars > 0) {
    bullets.push(
      `Open source contributor with ${profile.totalStars}+ stars across ${profile.repos.length} repositories`,
    );
  }

  const topLangs = Object.entries(profile.languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([lang]) => lang);

  if (topLangs.length > 0) {
    bullets.push(
      `Proficient in ${topLangs.join(", ")}`,
    );
  }

  for (const repo of profile.pinnedRepos.slice(0, 3)) {
    if (repo.stars > 0 || repo.forks > 0) {
      bullets.push(
        `Created ${repo.name}, a ${repo.language} project with ${repo.stars} stars and ${repo.forks} forks`,
      );
    }
  }

  return bullets;
}

export function generateProjectsFromGitHub(profile: GitHubProfile) {
  return profile.pinnedRepos.map((repo) => ({
    name: repo.name,
    description: repo.description,
    technologies: [repo.language, ...repo.topics].filter(Boolean),
    url: repo.url,
    highlights: [
      `${repo.stars} stars` + (repo.forks > 0 ? ` · ${repo.forks} forks` : ""),
    ],
  }));
}

export function generateSkillsFromGitHub(profile: GitHubProfile) {
  const skillMap = new Map<string, string[]>();

  for (const repo of profile.repos) {
    if (repo.language) {
      if (!skillMap.has(repo.language)) skillMap.set(repo.language, []);
      skillMap.get(repo.language)!.push(repo.name);
    }
    for (const topic of repo.topics) {
      if (!skillMap.has(topic)) skillMap.set(topic, []);
      skillMap.get(topic)!.push(repo.name);
    }
  }

  return Array.from(skillMap.entries())
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 10)
    .map(([skill]) => skill);
}
