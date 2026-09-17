/**
 * Snippet Library — localStorage-backed reusable bullet snippets.
 */

import { generateId } from "@/lib/utils";

const STORAGE_KEY = "careerforge-snippets-v1";

export interface Snippet {
  id: string;
  label: string;
  text: string;
  createdAt: number;
}

export function loadSnippets(): Snippet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Snippet[]) : [];
  } catch {
    return [];
  }
}

export function saveSnippets(snippets: Snippet[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}

export function addSnippet(label: string, text: string): Snippet {
  const snippets = loadSnippets();
  const s: Snippet = { id: generateId(), label: label.trim() || text.slice(0, 40), text, createdAt: Date.now() };
  snippets.unshift(s);
  saveSnippets(snippets);
  return s;
}

export function deleteSnippet(id: string): void {
  const snippets = loadSnippets().filter((s) => s.id !== id);
  saveSnippets(snippets);
}
