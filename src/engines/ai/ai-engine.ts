import type { AIAction } from "@/types";

const GOAL_INSTRUCTIONS: Record<string, string> = {
  startup:
    "Target: tech startup. Prioritise impact, ownership, breadth, and velocity. " +
    "Highlight shipped products, initiative, and cross-functional collaboration.",
  faang:
    "Target: FAANG / Big Tech. Prioritise algorithmic complexity, scale, systems thinking, " +
    "and measurable metrics (latency, throughput, reliability). Use STAR format.",
  government:
    "Target: government. Prioritise compliance, process rigour, documentation, " +
    "stakeholder communication, and security clearances where relevant.",
  academia:
    "Target: academia. Prioritise publications, grants, teaching, conference talks, " +
    "and research methodology. Use formal tone.",
};

const PROMPTS: Record<AIAction, string> = {
  "improve-bullet": `Improve the following resume bullet point to be more impactful and achievement-oriented.
    Make it measurable, use strong action verbs, and keep it concise.
    {{GOAL}}
    Return ONLY the improved bullet point. Do not add explanations.
    
    Original:`,
   
  "rewrite-summary": `Rewrite the following professional summary to be more compelling and ATS-friendly.
    Keep it 2-4 sentences. Focus on impact, skills, and career narrative.
    {{GOAL}}
    Return ONLY the rewritten summary. Do not add explanations.
    
    Original:`,
   
  "check-grammar": `Fix any grammar, spelling, or punctuation issues in the following text.
    Preserve the original meaning and style.
    {{GOAL}}
    Return ONLY the corrected text. Do not add explanations.
    
    Text:`,
   
  "suggest-achievements": `Suggest 3 measurable achievements for the following role description.
    Format as a numbered list with specific, quantifiable results.
    Never invent technologies or companies. Base suggestions on the context.
    {{GOAL}}
    
    Role:`,
   
  "generate-verbs": `Replace weak verbs in the following bullet points with stronger action verbs.
    Return the improved version.
    {{GOAL}}
    
    Text:`,

  "star-convert": `Rewrite the following bullet point using the STAR method (Situation, Task, Action, Result).
    Make it measurable and impactful. Use strong action verbs.
    If the original lacks context, infer realistic but honest details.
    {{GOAL}}
    Return ONLY the rewritten bullet point.
    
    Original:`,

  "parse-cv": `Extract resume data from the following text and return it as a JSON object with these fields:
    {
      "name": "Full Name",
      "email": "email@example.com",
      "phone": "phone number",
      "location": "city, state",
      "summary": "professional summary",
      "skills": ["skill1", "skill2"],
      "experience": [
        { "company": "Company Name", "position": "Job Title", "startDate": "YYYY-MM", "endDate": "YYYY-MM or Present", "bullets": ["bullet1", "bullet2"], "technologies": ["tech1"] }
      ],
      "education": [
        { "institution": "University", "degree": "Degree Type", "field": "Field of Study", "startDate": "YYYY-MM", "endDate": "YYYY-MM" }
      ],
      "certifications": [
        { "name": "Cert Name", "issuer": "Issuer", "date": "YYYY" }
      ],
      "projects": [
        { "name": "Project Name", "description": "Short description", "technologies": ["tech1"] }
      ],
      "languages": [
        { "language": "Language", "proficiency": "Native/Fluent/Conversational" }
      ]
    }
    Fill as many fields as you can from the text. Use null for missing fields. Return ONLY valid JSON, no other text.
    
    Text:`,
};

export function validateAIResponse(_action: AIAction, response: string): string {
  return response.trim();
}

export function buildAIPrompt(action: AIAction, content: string, context?: string): string {
  let prompt = PROMPTS[action];

  let goalInstruction = "";
  if (context) {
    goalInstruction = GOAL_INSTRUCTIONS[context] ?? "";
  }

  prompt = prompt.replace("{{GOAL}}", goalInstruction);

  let fullPrompt = `${prompt}\n\n${content}`;
  if (context && !GOAL_INSTRUCTIONS[context]) {
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
      return `1. Improved system performance through optimisation\n2. Led cross-functional team initiatives\n3. Reduced operational overhead`;
    case "star-convert":
      return `STAR Rewrite: ${content.replace(/^(worked|was|were|had|made|got|did)\s+/i, "Led ")}`;
    case "generate-verbs":
      return content.replace(/\b(worked|was|were|had|made)\b/gi, "Engineered");
    case "parse-cv":
      return JSON.stringify({
        name: content.split("\n")[0]?.trim() || "",
        summary: content.slice(0, 500),
        skills: content.match(/\b(React|Node|Python|JavaScript|TypeScript|AWS|Docker)\b/gi) || [],
      });
    default:
      return content;
  }
}
