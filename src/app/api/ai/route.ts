import { NextResponse } from "next/server";
import { buildAIPrompt, generateFallbackResponse } from "@/engines/ai/ai-engine";
import type { AIAction } from "@/types";

const MAX_TOKENS: Partial<Record<AIAction, number>> = {
  "parse-cv": 4000,
};

export async function POST(request: Request) {
  try {
    const { action, content, context, stream: wantStream } = await request.json();

    if (!action || !content) {
      return NextResponse.json({ error: "Missing action or content" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const result = generateFallbackResponse(action as AIAction, content);
      return NextResponse.json({ result });
    }

    const prompt = buildAIPrompt(action as AIAction, content, context);

    const max_tokens = MAX_TOKENS[action as AIAction] ?? 300;

    if (wantStream) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: "OpenAI API error" } }));
        return NextResponse.json({ error: err.error?.message ?? "OpenAI API error" }, { status: res.status });
      }

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const reader = res.body?.getReader();
          if (!reader) { controller.close(); return; }

          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            for (const line of chunk.split("\n")) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") { controller.close(); return; }
                try {
                  const parsed = JSON.parse(data);
                  const text = parsed.choices?.[0]?.delta?.content ?? "";
                  if (text) controller.enqueue(encoder.encode(text));
                } catch { /* skip parse errors */ }
              }
            }
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: "OpenAI API error" } }));
      return NextResponse.json({ error: err.error?.message ?? "OpenAI API error" }, { status: res.status });
    }

    const data = await res.json();
    const result = data.choices?.[0]?.message?.content ?? generateFallbackResponse(action as AIAction, content);

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
