import type { ResumeData, ResumeLayout } from "@/types";

export const sampleResumeData: ResumeData = {
  personal: {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexjohnson",
    github: "github.com/alexjohnson",
    website: "alexjohnson.dev",
    photo: null,
    summary:
      "Senior Software Engineer with 7 years of experience building scalable distributed systems. Passionate about clean code, performance, and developer experience. Shipped products used by millions of users across cloud and consumer applications.",
  },
  experience: [
    {
      id: "exp-sample-1",
      company: "Vercel",
      position: "Senior Software Engineer",
      location: "Remote",
      startDate: "2021-03",
      endDate: "",
      current: true,
      bullets: [
        "Reduced p99 cold-start latency by 45% by optimising the edge runtime initialisation pipeline",
        "Shipped the App Router feature used by 1M+ developers within 3 months of launch",
        "Led migration from Pages Router to App Router across 200+ internal apps",
        "Mentored 4 junior engineers through structured code-review and pairing sessions",
      ],
      technologies: ["TypeScript", "React", "Next.js", "Node.js", "Edge Computing"],
    },
    {
      id: "exp-sample-2",
      company: "Stripe",
      position: "Software Engineer",
      location: "San Francisco, CA",
      startDate: "2018-07",
      endDate: "2021-02",
      current: false,
      bullets: [
        "Built a fraud-detection ML pipeline that saved $40M/year in chargebacks",
        "Migrated 12 services from REST to gRPC, cutting p95 latency by 30%",
        "Owned the on-call rotation for the Payments API (4M req/min)",
        "Authored internal RFCs adopted org-wide for service-mesh rollout",
      ],
      technologies: ["Ruby", "Go", "Python", "Kafka", "PostgreSQL"],
    },
    {
      id: "exp-sample-3",
      company: "Google",
      position: "Software Engineer Intern",
      location: "Mountain View, CA",
      startDate: "2017-06",
      endDate: "2017-08",
      current: false,
      bullets: [
        "Built a regression-testing tool for YouTube's video-encoding pipeline, reducing manual QA hours by 60%",
        "Presented findings to a team of 15 senior engineers",
      ],
      technologies: ["C++", "Python"],
    },
  ],
  education: [
    {
      id: "edu-sample-1",
      institution: "Stanford University",
      degree: "BSc",
      field: "Computer Science",
      location: "Stanford, CA",
      startDate: "2014-09",
      endDate: "2018-06",
      gpa: "3.92",
      honors: ["Phi Beta Kappa", "Dean's List"],
    },
  ],
  skills: [
    {
      id: "skills-sample-1",
      category: "Languages",
      skills: ["TypeScript", "JavaScript", "Python", "Go", "Ruby", "C++"],
    },
    {
      id: "skills-sample-2",
      category: "Frontend",
      skills: ["React", "Next.js", "TailwindCSS", "Web Components"],
    },
    {
      id: "skills-sample-3",
      category: "Backend",
      skills: ["Node.js", "PostgreSQL", "Redis", "Kafka", "gRPC"],
    },
    {
      id: "skills-sample-4",
      category: "Cloud & DevOps",
      skills: ["AWS", "Vercel", "Docker", "Kubernetes", "Terraform"],
    },
  ],
  projects: [
    {
      id: "proj-sample-1",
      name: "EdgeQuery",
      role: "Creator & Maintainer",
      description:
        "Open-source distributed query engine for edge runtimes. 2.3k GitHub stars, 12 contributors.",
      technologies: ["TypeScript", "WebAssembly", "Rust"],
      url: "github.com/alexjohnson/edgequery",
      highlights: [
        "Designed a streaming SQL parser with O(n) tokenisation",
        "Built cross-runtime compatibility (Cloudflare, Vercel, Deno)",
      ],
    },
  ],
  certifications: [],
  languages: [
    { id: "lang-sample-1", language: "English", proficiency: "Native" },
    { id: "lang-sample-2", language: "Spanish", proficiency: "Conversational" },
  ],
  publications: [],
};

export const sampleResumeLayout: ResumeLayout = {
  columns: "one",
  showPicture: false,
  picturePosition: "left",
  primaryColor: "#000000",
  fontSize: "medium",
  spacing: "normal",
};
