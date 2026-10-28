import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { SectionHeader } from "./section-header";
import { Sparkles, Code2, GitBranch, ShieldCheck } from "lucide-react";

/**
 * "Built for engineers" — a small section with a code-style visual that
 * signals the audience we serve. No fake metrics; just the things that
 * matter to engineers (ATS score latency, source-available, no tracking).
 */
export function BuiltForEngineers() {
  return (
    <Section background="default">
      <Container size="wide">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <SectionHeader
            eyebrow="Built for engineers"
          title="Private by default. Open source by design."
          description="Build and review your resume in the browser. Your content stays on your device unless you choose to share or export it."
          />

          <div className="rounded-2xl border bg-zinc-950 p-6 font-mono text-sm text-zinc-300 shadow-lg shadow-zinc-950/20">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-xs text-zinc-500">
              <Code2 className="h-3.5 w-3.5" />
              <span>safarcraft / resume-checks.ts</span>
            </div>
            <pre className="mt-3 overflow-x-auto text-[13px] leading-relaxed">
              <code>
                <span className="text-emerald-400">const</span>{" "}
                <span className="text-sky-300">review</span> ={" "}
                <span className="text-amber-300">reviewResume</span>
                <span className="text-zinc-400">(</span>
                <span className="text-zinc-300">resume</span>
                <span className="text-zinc-400">)</span>
                <span className="text-zinc-400">;</span>{"\n"}
                <span className="text-zinc-500">{"// Clear checks, processed in your browser"}</span>
                {"\n\n"}
                <span className="text-emerald-400">return</span>{" "}
                <span className="text-sky-300">review</span>
                <span className="text-zinc-400">.</span>
                <span className="text-amber-300">suggestions</span>
                <span className="text-zinc-400">;</span>{" "}
                <span className="text-zinc-500">{"// review, edit, decide"}</span>
              </code>
            </pre>
          </div>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Sparkles, title: "Practical resume checks", body: "Deterministic feedback you can review and decide how to use." },
            { icon: GitBranch, title: "Open source", body: "MIT licensed. Self-host with Docker in one command." },
            { icon: ShieldCheck, title: "No tracking", body: "Anonymised GA only behind an env var. Disabled by default." },
          ].map((c) => (
            <li key={c.title}>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
