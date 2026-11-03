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

export type TemplateId =
  | "classic-ats"
  | "modern-professional"
  | "executive"
  | "pikachu"
  | "onyx"
  | "leafish"
  | "bronzor"
  | "gengar";

export type ExportFormat = "pdf" | "docx" | "markdown" | "json";

export type PaperSize = "letter" | "a4" | "legal";

export type ColumnLayout = "one" | "two";

export type ATSAxisId = "contact" | "experience" | "impact" | "skills" | "format";

export type ATSDeduction = {
  id: string;
  category: string;
  axis: ATSAxisId;
  points: number;
  reason: string;
  evidence?: string;
  fix: string;
  severity: "high" | "medium" | "low";
};

export type ATSAxis = {
  id: ATSAxisId;
  label: string;
  description: string;
  score: number;
  weight: number;
};

export type ATSJobMatch = {
  score: number;
  requiredCoverage: number;
  preferredCoverage: number;
  skillsOverlap: number;
  seniorityFit: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  requiredKeywords: string[];
  preferredKeywords: string[];
  seniority: string;
  evidence: Array<{ keyword: string; found: boolean; required: boolean }>;
};

export type ATSResult = {
  /** Targeted score when a JD is present, otherwise general readiness. */
  score: number;
  readinessScore: number;
  jobMatch: ATSJobMatch | null;
  axes: ATSAxis[];
  deductions: ATSDeduction[];
  recommendations: string[];
  strengths: string[];
  label: { label: string; color: string };
};

export type JDParseResult = {
  skills: string[];
  technologies: string[];
  jdSkills: string[];
  responsibilities: string[];
  experienceLevel: string;
  matchScore: number;
  missingSkills: string[];
  suggestions: string[];
  keywordHeatmap: Record<string, number>;
  requiredSkills?: string[];
  preferredSkills?: string[];
  requiredCoverage?: number;
  preferredCoverage?: number;
  skillsOverlap?: number;
  seniorityFit?: number;
};

export type GitHubProfile = {
  username: string;
  name: string;
  bio: string;
  avatar: string;
  repos: GitHubRepo[];
  totalStars: number;
  totalForks: number;
  /** Number of the user's repositories that are forks of other projects. */
  forkedRepos: number;
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
