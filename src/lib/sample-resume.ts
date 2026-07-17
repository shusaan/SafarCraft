import type { ResumeData } from "@/types";

export function getSampleResume(): ResumeData {
  return {
    personal: {
      name: "Alex Johnson",
      email: "alex.johnson@email.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/alexjohnson",
      github: "github.com/alexjohnson",
      website: "",
      photo: null,
      summary: "Full-stack software engineer with 5+ years of experience building scalable web applications. Passionate about clean code, user experience, and open-source contributions.",
    },
    experience: [
      {
        id: "exp-1",
        company: "TechCorp Inc.",
        position: "Senior Software Engineer",
        location: "San Francisco, CA",
        startDate: "2022-01",
        endDate: "",
        current: true,
        bullets: [
          "Led development of microservices architecture serving 1M+ daily users",
          "Reduced API response time by 40% through query optimization and caching",
          "Mentored team of 3 junior developers, improving code quality metrics by 25%",
        ],
        technologies: ["React", "Node.js", "TypeScript", "PostgreSQL", "Redis"],
      },
      {
        id: "exp-2",
        company: "StartupXYZ",
        position: "Software Engineer",
        location: "Remote",
        startDate: "2020-06",
        endDate: "2021-12",
        current: false,
        bullets: [
          "Built real-time collaboration features using WebSockets",
          "Implemented CI/CD pipeline reducing deployment time by 60%",
          "Developed REST APIs handling 10K+ requests per minute",
        ],
        technologies: ["Vue.js", "Python", "Docker", "AWS"],
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science",
        field: "Computer Science",
        location: "Berkeley, CA",
        startDate: "2016-08",
        endDate: "2020-05",
        gpa: "3.8",
        honors: ["Dean's List", "Graduated with Honors"],
      },
    ],
    skills: [
      {
        id: "skill-1",
        category: "Languages",
        skills: ["TypeScript", "JavaScript", "Python", "SQL", "HTML/CSS"],
      },
      {
        id: "skill-2",
        category: "Frameworks",
        skills: ["React", "Next.js", "Node.js", "Express", "Vue.js"],
      },
      {
        id: "skill-3",
        category: "Tools",
        skills: ["Git", "Docker", "AWS", "PostgreSQL", "Redis"],
      },
    ],
    certifications: [],
    projects: [
      {
        id: "proj-1",
        name: "Open Source Resume Builder",
        role: "Creator & Lead Developer",
        description: "AI-powered resume builder for software engineers with ATS optimization",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
        url: "github.com/alexjohnson/resume-builder",
        highlights: ["500+ GitHub stars", "Featured in dev newsletters"],
      },
    ],
    languages: [
      { id: "lang-1", language: "English", proficiency: "Native" },
      { id: "lang-2", language: "Spanish", proficiency: "Conversational" },
    ],
    publications: [],
  };
}
