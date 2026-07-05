import { describe, it, expect } from "vitest";
import { generateContributionBullets, generateSkillsFromGitHub, generateProjectsFromGitHub } from "@/engines/github/github-engine";
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
});
