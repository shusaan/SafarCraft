"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useResumeStore } from "@/stores/resume-store";
import { useToast } from "@/components/ui/toast";
import { fetchGitHubProfile, generateProjectsFromGitHub, generateSkillsFromGitHub } from "@/engines/github/github-engine";
import { generateId } from "@/lib/utils";
import { GitBranch, Star, GitFork, Code2 } from "lucide-react";
import { SkeletonCard } from "@/components/ui/skeleton";

export function GitHubImport() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof fetchGitHubProfile>> | null>(null);
  const updateData = useResumeStore((s) => s.updateData);
  const skills = useResumeStore((s) => s.data.skills);
  const projects = useResumeStore((s) => s.data.projects);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      const data = await fetchGitHubProfile(username.trim());
      setProfile(data);
      toast({ title: `Imported ${data.name}`, variant: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("rate limit")) {
        toast({
          title: "Rate limited",
          description: "GitHub API rate limit exceeded. Try again in a few minutes.",
          variant: "destructive",
        });
      } else if (message.includes("not found")) {
        toast({
          title: "User not found",
          description: `GitHub user "${username}" doesn't exist. Check the username and try again.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import failed",
          description: "Could not fetch GitHub profile. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const applyContributions = () => {
    if (!profile) return;
    const existing = skills;
    const newSkills = generateSkillsFromGitHub(profile);
    const categoryId = generateId();

    updateData({
      skills: [
        ...existing,
        { id: categoryId, category: "Open Source", skills: newSkills },
      ],
    });
    toast({ title: "Skills added from GitHub", variant: "success" });
  };

  const applyProjects = () => {
    if (!profile) return;
    const ghProjects = generateProjectsFromGitHub(profile);
    const newProjects = ghProjects.map((p) => ({
      id: generateId(),
      name: p.name,
      role: "Creator",
      description: p.description,
      technologies: p.technologies,
      url: p.url,
      highlights: p.highlights,
    }));

    updateData({ projects: [...projects, ...newProjects] });
    toast({ title: "Projects added from GitHub", variant: "success" });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <GitBranch className="h-5 w-5" />
          GitHub Intelligence
        </h2>
        <p className="text-sm text-muted-foreground">Import your GitHub profile to auto-generate resume content</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username..."
          onKeyDown={(e) => e.key === "Enter" && handleImport()}
        />
        <Button onClick={handleImport} disabled={loading}>
          {loading ? "Importing..." : "Import"}
        </Button>
      </div>

      {loading && (
        <div aria-label="Loading GitHub profile" aria-live="polite">
          <SkeletonCard />
        </div>
      )}

      {profile && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <img src={profile.avatar} alt="" className="h-12 w-12 rounded-full" />
              <div>
                <p className="font-semibold">{profile.name}</p>
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {profile.totalStars} stars</span>
              <span className="flex items-center gap-1"><GitFork className="h-3.5 w-3.5" /> {profile.totalForks} forks</span>
              <span className="flex items-center gap-1"><Code2 className="h-3.5 w-3.5" /> {Object.keys(profile.languages).length} languages</span>
            </div>
            {profile.pinnedRepos.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Top Repositories</p>
                {profile.pinnedRepos.slice(0, 4).map((repo) => (
                  <div key={repo.name} className="flex items-center justify-between rounded-md bg-muted p-2 text-sm">
                    <span className="font-medium">{repo.name}</span>
                    <span className="text-xs text-muted-foreground">★ {repo.stars}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={applyContributions}>Add Skills</Button>
              <Button size="sm" variant="outline" onClick={applyProjects}>Add Projects</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
