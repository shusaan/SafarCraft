export type {
  ResumeData,
  ResumeLayout,
  ExperienceEntry,
  EducationEntry,
  SkillCategory,
  CertificationEntry,
  ProjectEntry,
  LanguageEntry,
  PublicationEntry,
} from "./resume";

export { defaultResumeData, defaultResumeLayout } from "./resume";

export type TemplateId = "classic-ats" | "modern-professional" | "executive";

export type ExportFormat = "pdf" | "docx" | "markdown";

export type PaperSize = "letter" | "a4" | "legal";

export type ColumnLayout = "one" | "two";

export type ATSResult = {
  score: number;
  deductions: ATSDeduction[];
  recommendations: string[];
  keywordMatch: KeywordMatch[];
};

export type ATSDeduction = {
  category: string;
  points: number;
  reason: string;
  severity: "high" | "medium" | "low";
};

export type KeywordMatch = {
  keyword: string;
  found: boolean;
  count: number;
  importance: "critical" | "important" | "optional";
};

export type AIAction =
  | "improve-bullet"
  | "rewrite-summary"
  | "check-grammar"
  | "suggest-achievements"
  | "generate-verbs"
  | "star-convert";

export type AIRequest = {
  action: AIAction;
  content: string;
  context?: string;
};

export type AIResponse = {
  result: string;
  suggestions?: string[];
};

export type JDParseResult = {
  skills: string[];
  technologies: string[];
  responsibilities: string[];
  experienceLevel: string;
  matchScore: number;
  missingSkills: string[];
  suggestions: string[];
  keywordHeatmap: Record<string, number>;
};

export type GitHubProfile = {
  username: string;
  name: string;
  bio: string;
  avatar: string;
  repos: GitHubRepo[];
  totalStars: number;
  totalForks: number;
  languages: Record<string, number>;
  pinnedRepos: GitHubRepo[];
  contributions: number;
};

export type GitHubRepo = {
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  isPinned: boolean;
  updatedAt: string;
};

export type PortfolioType = "website" | "landing" | "readme" | "bio";

export type AnalyticsEvent = {
  event: string;
  metadata?: Record<string, string | number | boolean>;
};

export type VisitorCount = {
  total: number;
  today: number;
};

declare global {
  interface Window {
    gtag: (command: string, event: string, params?: Record<string, unknown>) => void;
  }

  const gapi: {
    load: (api: string, callback: () => void) => void;
    picker: {
      PickerBuilder: new () => PickerBuilder;
      DocsView: new () => DocsView;
      Action: { PICKED: string };
    };
  };

  interface PickerBuilder {
    addView(view: DocsView): this;
    setOAuthToken(token: string): this;
    setDeveloperKey(key: string): this;
    setCallback(fn: (data: { action: string; docs?: Array<{ id: string }> }) => void): this;
    build(): { setVisible(visible: boolean): void };
  }

  interface DocsView {
    setIncludeFolders(v: boolean): this;
    setMimeTypes(m: string): this;
    setSelectFolderEnabled(v: boolean): this;
  }

  namespace google.accounts.oauth2 {
    interface TokenClientConfig {
      client_id: string;
      scope: string;
      callback: (response: { access_token?: string; error?: string }) => void;
    }
    interface TokenClient {
      requestAccessToken(config?: { prompt?: string }): void;
    }
    function initTokenClient(config: TokenClientConfig): TokenClient;
  }
}
