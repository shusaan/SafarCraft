"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { addSnippet, deleteSnippet, loadSnippets, type Snippet } from "@/engines/snippets/library";
import { Plus, Trash2, Copy, Check } from "lucide-react";

export function SnippetLibrary() {
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [label, setLabel] = useState("");
  const [text, setText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setSnippets(loadSnippets());
  }, []);

  const handleAdd = () => {
    if (!text.trim()) return;
    const s = addSnippet(label, text);
    setSnippets(loadSnippets());
    setLabel("");
    setText("");
    toast({ title: "Snippet saved", variant: "success" });
    // s.id available for future tracking
    void s;
  };

  const handleDelete = (id: string) => {
    deleteSnippet(id);
    setSnippets(loadSnippets());
    toast({ title: "Snippet deleted", variant: "default" });
  };

  const handleCopy = async (s: Snippet) => {
    await navigator.clipboard.writeText(s.text);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Snippet Library</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Label</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Mentoring" />
        </div>
        <div className="space-y-1">
          <Label>Snippet</Label>
          <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g., Mentored N junior engineers…" />
        </div>
        <Button onClick={handleAdd} disabled={!text.trim()}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Save snippet
        </Button>

        {snippets.length === 0 ? (
          <p className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            No snippets saved yet. Save reusable bullets here for one-click insertion into any experience entry.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {snippets.map((s) => (
              <li key={s.id} className="flex items-start gap-2 rounded-md border bg-card p-2 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs">{s.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.text}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(s)} aria-label="Copy">
                  {copiedId === s.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(s.id)} aria-label="Delete">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
