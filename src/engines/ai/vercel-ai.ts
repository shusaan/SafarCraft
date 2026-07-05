import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { buildAIPrompt } from "@/engines/ai/ai-engine";
import { generateFallbackResponse } from "@/engines/ai/ai-engine";
import type { AIAction } from "@/types";

export async function callVercelAI(action: AIAction, content: string, context?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return generateFallbackResponse(action, content);
  }

  try {
    const prompt = buildAIPrompt(action, content, context);
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
      maxTokens: 300,
    });
    return text;
  } catch {
    return generateFallbackResponse(action, content);
  }
}
