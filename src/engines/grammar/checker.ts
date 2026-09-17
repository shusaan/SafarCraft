/**
 * Grammar & Style Checker
 * Pure regex / dictionary-based linter. Zero external deps, 100% offline.
 * Catches: weasel words, passive voice (heuristic), common style issues, doubled words.
 * For full spellcheck the user can paste into their browser's native spellcheck.
 */

export interface GrammarIssue {
  kind: "weasel" | "passive" | "doubled" | "style" | "cliche" | "weak-phrase";
  message: string;
  snippet: string;
  start: number;
  end: number;
}

const WEASEL_WORDS = [
  "very",
  "really",
  "quite",
  "rather",
  "somewhat",
  "fairly",
  "basically",
  "essentially",
  "literally",
  "actually",
  "definitely",
  "obviously",
  "clearly",
  "simply",
  "just",
];

const CLICHES = [
  "think outside the box",
  "hit the ground running",
  "low-hanging fruit",
  "move the needle",
  "best of breed",
  "best-in-class",
  "synergy",
  "leverage synergies",
  "circle back",
  "touch base",
  "value-add",
  "win-win",
  "game-changer",
  "rockstar",
  "ninja",
  "guru",
];

const WEAK_PHRASES: Array<{ pattern: RegExp; tip: string }> = [
  { pattern: /\bin order to\b/gi, tip: "Use 'to' instead of 'in order to'" },
  { pattern: /\bdue to the fact that\b/gi, tip: "Use 'because' instead of 'due to the fact that'" },
  { pattern: /\bat this point in time\b/gi, tip: "Use 'now' instead of 'at this point in time'" },
  { pattern: /\ba large number of\b/gi, tip: "Use 'many' instead of 'a large number of'" },
  { pattern: /\bin the event that\b/gi, tip: "Use 'if' instead of 'in the event that'" },
  { pattern: /\bprior to\b/gi, tip: "Use 'before' instead of 'prior to'" },
  { pattern: /\bfor the purpose of\b/gi, tip: "Use 'to' or 'for' instead of 'for the purpose of'" },
  { pattern: /\bwith regard to\b/gi, tip: "Use 'about' or 'regarding' instead of 'with regard to'" },
  { pattern: /\bin the near future\b/gi, tip: "Use 'soon' instead of 'in the near future'" },
  { pattern: /\bthe majority of\b/gi, tip: "Use 'most' instead of 'the majority of'" },
];

const PASSIVE_RE = /\b(is|are|was|were|be|been|being)\s+(\w+ed|built|done|made|seen|known|written|given|taken|chosen|spoken|broken|driven|brought|sold|told|held|paid|sent|spent|met|set|put|cut|hit|let|read|run|spread)\b/gi;
const DOUBLED_RE = /\b(\w+)\s+\1\b/gi;

export function checkGrammar(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  for (const word of WEASEL_WORDS) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      issues.push({
        kind: "weasel",
        message: `Weasel word "${m[0]}" — remove or replace with a stronger word.`,
        snippet: m[0],
        start: m.index,
        end: m.index + m[0].length,
      });
    }
  }

  for (const cliche of CLICHES) {
    const re = new RegExp(cliche, "gi");
    const m = re.exec(text);
    if (m) {
      issues.push({
        kind: "cliche",
        message: `Cliché "${cliche}" — replace with a concrete, specific phrase.`,
        snippet: m[0],
        start: m.index,
        end: m.index + m[0].length,
      });
    }
  }

  for (const { pattern, tip } of WEAK_PHRASES) {
    const m = pattern.exec(text);
    if (m) {
      issues.push({
        kind: "weak-phrase",
        message: `${tip}. Found "${m[0]}".`,
        snippet: m[0],
        start: m.index,
        end: m.index + m[0].length,
      });
    }
  }

  let m: RegExpExecArray | null;
  while ((m = PASSIVE_RE.exec(text)) !== null) {
    issues.push({
      kind: "passive",
      message: `Possible passive voice — prefer active: "${m[0]}".`,
      snippet: m[0],
      start: m.index,
      end: m.index + m[0].length,
    });
  }
  PASSIVE_RE.lastIndex = 0;

  while ((m = DOUBLED_RE.exec(text)) !== null) {
    issues.push({
      kind: "doubled",
      message: `Doubled word "${m[0]}".`,
      snippet: m[0],
      start: m.index,
      end: m.index + m[0].length,
    });
  }
  DOUBLED_RE.lastIndex = 0;

  return issues.sort((a, b) => a.start - b.start);
}
