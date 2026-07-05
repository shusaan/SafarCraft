"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useResumeStore } from "@/stores/resume-store";
import { useToast } from "@/components/ui/toast";
import { generatePersonalWebsite, generateGitHubReadme, generateShortBio, generateLandingPage } from "@/engines/export/portfolio";
import { Globe, FileCode, User, Layout, Copy, Check, Download } from "lucide-react";

export function PortfolioGenerator() {
  const data = useResumeStore((s) => s.data);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"website" | "readme" | "bio" | "landing">("website");
  const [copied, setCopied] = useState(false);

  const getContent = () => {
    switch (activeTab) {
      case "website": return generatePersonalWebsite(data);
      case "readme": return generateGitHubReadme(data);
      case "bio": return generateShortBio(data);
      case "landing": return generateLandingPage(data);
    }
  };

  const content = getContent();

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard", variant: "success" });
  };

  const downloadContent = () => {
    const ext = activeTab === "website" ? "html" : activeTab === "landing" ? "html" : activeTab === "readme" ? "md" : "txt";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.personal.name || "portfolio"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold">Portfolio Generator</h2>
        <p className="text-sm text-muted-foreground">Generate portfolio pages from your resume data</p>
      </div>

      <div className="flex gap-2">
        <Button variant={activeTab === "website" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("website")}>
          <Globe className="mr-1 h-4 w-4" /> Website
        </Button>
        <Button variant={activeTab === "readme" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("readme")}>
          <FileCode className="mr-1 h-4 w-4" /> GitHub README
        </Button>
        <Button variant={activeTab === "bio" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("bio")}>
          <User className="mr-1 h-4 w-4" /> Short Bio
        </Button>
        <Button variant={activeTab === "landing" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("landing")}>
          <Layout className="mr-1 h-4 w-4" /> Landing Page
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="mb-3 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={copyContent}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadContent}>
              <Download className="h-4 w-4" /> Download
            </Button>
          </div>
          {activeTab === "bio" ? (
            <p className="text-sm">{content}</p>
          ) : (
            <pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 text-xs">{content}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
