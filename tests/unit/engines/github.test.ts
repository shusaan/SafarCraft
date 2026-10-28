import { describe, it, expect, vi } from "vitest";
import { fetchGitHubProfile, generateContributionBullets, generateSkillsFromGitHub, generateProjectsFromGitHub } from "@/engines/github/github-engine";
import type { GitHubProfile } from "@/types";

const mockProfile: GitHubProfile = {
  username: "testuser",
  name: "Test User",
  bio: "Engineer",
  avatar: "",
  repos: [
    {
      name: "awesome-project",
      fullName: "testuser/awesome-project",
      description: "An awesome project",
      url: "https://github.com/testuser/awesome-project",
      stars: 100,
      forks: 20,
      language: "TypeScript",
      topics: ["react", "node"],
      isPinned: true,
      updatedAt: "2024-01-01",
    },
  ],
  totalStars: 100,
  totalForks: 20,
  forkedRepos: 0,
  languages: { TypeScript: 3, Python: 2 },
  pinnedRepos: [],
  contributions: 50,
};

describe("GitHub Engine", () => {
  it("generates contribution bullets", () => {
    const bullets = generateContributionBullets(mockProfile);
    expect(bullets.length).toBeGreaterThan(0);
    expect(bullets[0]).toContain("100+ stars");
  });

  it("extracts skills from repos", () => {
    const skills = generateSkillsFromGitHub(mockProfile);
    expect(skills).toContain("TypeScript");
  });

  it("generates projects from pinned repos", () => {
    const projects = generateProjectsFromGitHub(mockProfile);
    expect(projects).toBeDefined();
  });

  it("excludes forked repos from top list, stars, and stats", async () => {
    const repo = (over: Partial<Record<string, unknown>> = {}) => ({
      name: "repo",
      full_name: "testuser/repo",
      description: "",
      html_url: "https://github.com/testuser/repo",
      stargazers_count: 0,
      forks_count: 0,
      language: "TypeScript",
      topics: [],
      fork: false,
      updated_at: "2024-01-01",
      ...over,
    });

    const own = repo({ name: "own-project", stargazers_count: 30 });
    const famousFork = repo({ name: "forked-famous", stargazers_count: 100_000, fork: true });

    globalThis.fetch = vi.fn().mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        json: async () =>
          String(url).includes("/repos?")
            ? [own, famousFork]
            : { name: "Test User", bio: "", avatar_url: "", public_repos: 2 },
      }),
    ) as unknown as typeof fetch;

    const profile = await fetchGitHubProfile("testuser");

    expect(profile.repos).toHaveLength(1);
    expect(profile.repos[0]!.name).toBe("own-project");
    expect(profile.pinnedRepos.map((r) => r.name)).toEqual(["own-project"]);
    expect(profile.totalStars).toBe(30);
    expect(profile.forkedRepos).toBe(1);
    expect(profile.languages).toEqual({ TypeScript: 1 });
  });
});
