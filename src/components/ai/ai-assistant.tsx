"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useResumeStore } from "@/stores/resume-store";
import { Sparkles, Copy, Check, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AIAction } from "@/types";

const actions: Array<{ id: AIAction; label: string }> = [
  { id: "improve-bullet", label: "Improve Bullet" },
  { id: "rewrite-summary", label: "Rewrite Summary" },
  { id: "check-grammar", label: "Check Grammar" },
  { id: "suggest-achievements", label: "Suggest Achievements" },
  { id: "generate-verbs", label: "Generate Stronger Verbs" },
];

const goalHints: Record<string, string> = {
  startup:    "For startups, emphasise ownership, shipped products, and cross-functional impact.",
  faang:      "For FAANG, emphasise algorithmic complexity, scale, and measurable results.",
  government: "For government roles, emphasise compliance, process, and documentation.",
  academia:   "For academia, emphasise publications, grants, and teaching experience.",
};

export function AIAssistant() {
  const [action, setAction] = useState<AIAction>("improve-bullet");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const resumeGoal = useResumeStore((s) => s.resumeGoal);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, content: input, context: resumeGoal }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          toast({
            title: "API key missing",
            description: "Using local suggestions. Set OPENAI_API_KEY for AI features.",
            variant: "default",
          });
        } else {
          toast({
            title: "AI service unavailable",
            description: "You can continue editing manually. Try again later.",
            variant: "destructive",
          });
        }
      }
      setResult(data.result ?? "No response generated.");
    } catch {
      toast({
        title: "Network error",
        description: "Could not reach AI service. Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const useResult = () => {
    setInput(result);
    setResult("");
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-amber-500" />
          AI Assistant
        </h2>
        <p className="text-sm text-muted-foreground">Improve your resume content with AI</p>
      </div>

      <div className="rounded-lg border bg-primary/5 p-3 flex items-start gap-2" aria-live="polite">
        <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden="true" />
        <p id="goal-hint" className="text-xs text-muted-foreground leading-relaxed">
          {goalHints[resumeGoal] ?? "Tailor your content to the role you are targeting."}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Action</Label>
        <Select value={action} onValueChange={(v) => setAction(v as AIAction)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {actions.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Your Text</Label>
        <Textarea
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste the text you want to improve..."
          aria-describedby="goal-hint"
        />
      </div>

      <Button onClick={handleSubmit} disabled={loading || !input.trim()} className="w-full">
        {loading ? (
          <>
            <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Enhance with AI
          </>
        )}
      </Button>

      {loading && (
        <div className="space-y-3 rounded-lg border p-4" aria-label="Generating response">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      )}

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Result</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={copyResult} aria-label="Copy result">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={useResult}>
                Use
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm" aria-live="polite">{result}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
