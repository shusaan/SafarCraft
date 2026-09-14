/**
 * Cover Letter Generator
 * Template-based — 3-paragraph cover letter from inputs.
 */

export interface CoverLetterInput {
  jobTitle: string;
  company: string;
  highlights: string[];
  role?: string;
  yearsExperience?: number;
}

export function buildCoverLetter(input: CoverLetterInput): string {
  const title = input.jobTitle.trim() || "[Job Title]";
  const company = input.company.trim() || "[Company]";
  const role = input.role || "this role";
  const years = input.yearsExperience ?? 0;
  const highlights = input.highlights.map((h) => h.trim()).filter(Boolean).slice(0, 3);

  const intro = `Dear Hiring Team,

I'm applying for the ${title} position at ${company}. With ${years > 0 ? `${years}+ years of experience` : "a track record"} in software engineering, I'm excited about the opportunity to contribute to ${company}'s mission and to the work your team is shipping.`;

  const body =
    highlights.length > 0
      ? `In my recent work, I have:
${highlights.map((h) => `  • ${h}`).join("\n")}

These experiences shaped how I approach ${role}: I focus on shipping measurable impact, writing code that's easy to maintain, and partnering closely with cross-functional stakeholders.`
      : `In my recent work, I have focused on shipping measurable impact, writing code that's easy to maintain, and partnering closely with cross-functional stakeholders. I'm confident this approach would translate well to ${role} at ${company}.`;

  const closer = `I'd welcome the chance to discuss how my background fits ${company}'s roadmap. Thank you for your time and consideration.

Best regards,
[Your Name]`;

  return `${intro}\n\n${body}\n\n${closer}`;
}
