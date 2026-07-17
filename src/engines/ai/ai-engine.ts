import type { AIAction } from "@/types";

const PROMPTS: Record<AIAction, string> = {
  "improve-bullet": `Improve the following resume bullet point to be more impactful and achievement-oriented.
    Make it measurable, use strong action verbs, and keep it concise.
    Return ONLY the improved bullet point. Do not add explanations.
    
    Original:`,
  
  "rewrite-summary": `Rewrite the following professional summary to be more compelling and ATS-friendly.
    Keep it 2-4 sentences. Focus on impact, skills, and career narrative.
    Return ONLY the rewritten summary. Do not add explanations.
    
    Original:`,
  
  "check-grammar": `Fix any grammar, spelling, or punctuation issues in the following text.
    Preserve the original meaning and style.
    Return ONLY the corrected text. Do not add explanations.
    
    Text:`,
  
  "suggest-achievements": `Suggest 3 measurable achievements for the following role description.
    Format as a numbered list with specific, quantifiable results.
    Never invent technologies or companies. Base suggestions on the context.
    
    Role:`,
  
  "generate-verbs": `Replace weak verbs in the following bullet points with stronger action verbs.
    Return the improved version.
    
    Text:`,
};

export function validateAIResponse(_action: AIAction, response: string): string {
  return response.trim();
}

export function buildAIPrompt(action: AIAction, content: string, context?: string): string {
  const prompt = PROMPTS[action];
  let fullPrompt = `${prompt}\n\n${content}`;
  if (context) {
    fullPrompt += `\n\nContext: ${context}`;
  }
  return fullPrompt;
}

export function generateFallbackResponse(action: AIAction, content: string): string {
  switch (action) {
    case "improve-bullet":
      return `Enhanced: ${content.replace(/^(worked|was|were|had|made|got|did)\s+/i, "")}`;
    case "rewrite-summary":
      return content;
    case "check-grammar":
      return content;
    case "suggest-achievements":
      return `1. Improved system performance through optimization\n2. Led cross-functional team initiatives\n3. Reduced operational overhead`;
    case "generate-verbs":
      return content.replace(/\b(worked|was|were|had|made)\b/gi, "Engineered");
    default:
      return content;
  }
}
