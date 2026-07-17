import { z } from "zod";

export const personalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().url("Invalid URL").or(z.literal("")).optional(),
  github: z.string().url("Invalid URL").or(z.literal("")).optional(),
  website: z.string().url("Invalid URL").or(z.literal("")).optional(),
  photo: z.string().nullable().optional(),
  summary: z.string().optional(),
});

export const experienceEntrySchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  bullets: z.array(z.string()),
  technologies: z.array(z.string()),
});

export const educationEntrySchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().optional(),
  field: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  honors: z.array(z.string()),
});

export const skillCategorySchema = z.object({
  id: z.string(),
  category: z.string().optional(),
  skills: z.array(z.string()),
});

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
});

export const projectEntrySchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  role: z.string().optional(),
  description: z.string().optional(),
  technologies: z.array(z.string()),
  url: z.string().optional(),
  highlights: z.array(z.string()),
});

export const languageEntrySchema = z.object({
  id: z.string(),
  language: z.string().optional(),
  proficiency: z.string().optional(),
});

export const resumeDataSchema = z.object({
  personal: personalSchema,
  experience: z.array(experienceEntrySchema),
  education: z.array(educationEntrySchema),
  skills: z.array(skillCategorySchema),
  certifications: z.array(certificationSchema),
  projects: z.array(projectEntrySchema),
  languages: z.array(languageEntrySchema),
  publications: z.array(z.any()),
});

export type ValidatedResumeData = z.infer<typeof resumeDataSchema>;
