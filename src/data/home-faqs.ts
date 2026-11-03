export interface HomeFaq {
  q: string;
  a: string;
}

export const HOME_FAQS: HomeFaq[] = [
  {
    q: "What is SafarCraft?",
    a: "SafarCraft is a free, open-source CV maker and resume builder. You edit in your browser, review practical ATS guidance, and export your document without creating an account.",
  },
  {
    q: "Is SafarCraft really free?",
    a: "Yes. Every template, ATS check, and export — including PDF and DOCX — is free. There is no paid tier, watermark, or download paywall.",
  },
  {
    q: "Do I need an account to build a resume?",
    a: "No. You can start a CV, edit it, and download it without signing up. Your draft is stored in your browser, and an account is only needed for optional cloud sync.",
  },
  {
    q: "Can I download my CV as a PDF or DOCX?",
    a: "Yes. SafarCraft exports PDF, DOCX, JSON Resume, Markdown, and plain text, so you can send the format an employer or job board asks for.",
  },
  {
    q: "Does SafarCraft guarantee my CV will pass ATS?",
    a: "No tool can guarantee that. SafarCraft provides deterministic checks across content, format, brevity, and impact so you can review and improve your CV before applying.",
  },
];
