// Share-link engine — encode a resume as a URL-safe compact string.
// Free tier: encoded into the URL hash (no server). Pro tier (future): stored on server.

import type { ResumeData, ResumeLayout } from "@/types";

export interface SharePayload {
  data: ResumeData;
  layout: ResumeLayout;
  template: string;
}

type Minimal = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary?: string;
  t?: string;
  exp?: Array<{ c?: string; p?: string; l?: string; s?: string; e?: string; cur?: 1; b?: string[]; k?: string[] }>;
  sk?: Array<[string, string[]]>;
  edu?: Array<{ i?: string; d?: string; f?: string; s?: string; e?: string; g?: string }>;
  proj?: Array<{ n?: string; r?: string; d?: string; k?: string[]; u?: string; h?: string[] }>;
  cert?: Array<{ n?: string; i?: string; d?: string; u?: string }>;
  lang?: Array<{ l?: string; p?: string }>;
};

function minimalFromPayload(p: SharePayload): Minimal {
  const { data } = p;
  return {
    name: data.personal.name || undefined,
    email: data.personal.email || undefined,
    phone: data.personal.phone || undefined,
    location: data.personal.location || undefined,
    linkedin: data.personal.linkedin || undefined,
    github: data.personal.github || undefined,
    website: data.personal.website || undefined,
    summary: data.personal.summary || undefined,
    t: p.template || undefined,
    exp: data.experience.map((e) => ({
      c: e.company || undefined,
      p: e.position || undefined,
      l: e.location || undefined,
      s: e.startDate || undefined,
      e: e.current ? undefined : e.endDate || undefined,
      cur: e.current ? 1 : undefined,
      b: e.bullets.length ? e.bullets : undefined,
      k: e.technologies.length ? e.technologies : undefined,
    })),
    sk: data.skills.map((c) => [c.category, c.skills]),
    edu: data.education.map((e) => ({
      i: e.institution || undefined,
      d: e.degree || undefined,
      f: e.field || undefined,
      s: e.startDate || undefined,
      e: e.endDate || undefined,
      g: e.gpa || undefined,
    })),
    proj: data.projects.map((p) => ({
      n: p.name || undefined,
      r: p.role || undefined,
      d: p.description || undefined,
      k: p.technologies.length ? p.technologies : undefined,
      u: p.url || undefined,
      h: p.highlights.length ? p.highlights : undefined,
    })),
    cert: data.certifications.map((c) => ({
      n: c.name || undefined,
      i: c.issuer || undefined,
      d: c.date || undefined,
      u: c.url || undefined,
    })),
    lang: data.languages.map((l) => ({ l: l.language || undefined, p: l.proficiency || undefined })),
  };
}

function payloadFromMinimal(m: Minimal): SharePayload {
  const data: ResumeData = {
    personal: {
      name: m.name ?? "",
      email: m.email ?? "",
      phone: m.phone ?? "",
      location: m.location ?? "",
      linkedin: m.linkedin ?? "",
      github: m.github ?? "",
      website: m.website ?? "",
      photo: null,
      summary: m.summary ?? "",
    },
    experience: (m.exp ?? []).map((e) => ({
      id: `e-${Math.random().toString(36).slice(2, 9)}`,
      company: e.c ?? "",
      position: e.p ?? "",
      location: e.l ?? "",
      startDate: e.s ?? "",
      endDate: e.e ?? "",
      current: !!e.cur,
      bullets: e.b ?? [],
      technologies: e.k ?? [],
    })),
    education: (m.edu ?? []).map((e) => ({
      id: `ed-${Math.random().toString(36).slice(2, 9)}`,
      institution: e.i ?? "",
      degree: e.d ?? "",
      field: e.f ?? "",
      location: "",
      startDate: e.s ?? "",
      endDate: e.e ?? "",
      gpa: e.g ?? "",
      honors: [],
    })),
    skills: (m.sk ?? []).map(([category, sk], i) => ({
      id: `s-${i}`,
      category: category || "Skills",
      skills: sk,
    })),
    projects: (m.proj ?? []).map((p) => ({
      id: `p-${Math.random().toString(36).slice(2, 9)}`,
      name: p.n ?? "",
      role: p.r ?? "",
      description: p.d ?? "",
      technologies: p.k ?? [],
      url: p.u ?? "",
      highlights: p.h ?? [],
    })),
    certifications: (m.cert ?? []).map((c) => ({
      id: `c-${Math.random().toString(36).slice(2, 9)}`,
      name: c.n ?? "",
      issuer: c.i ?? "",
      date: c.d ?? "",
      url: c.u ?? "",
    })),
    languages: (m.lang ?? []).map((l) => ({
      id: `l-${Math.random().toString(36).slice(2, 9)}`,
      language: l.l ?? "",
      proficiency: l.p ?? "",
    })),
    publications: [],
  };
  const layout: ResumeLayout = {
    columns: "one",
    showPicture: false,
    picturePosition: "left",
    primaryColor: "#000000",
    fontSize: "medium",
    spacing: "normal",
  };
  return { data, layout, template: m.t ?? "classic-ats" };
}

// Encode using base64url + JSON. We rely on the browser's `btoa` for safety.
export function encodeResume(payload: SharePayload): string {
  const minimal = minimalFromPayload(payload);
  const json = JSON.stringify(minimal);
  const utf8 = unescape(encodeURIComponent(json));
  return btoa(utf8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeResume(encoded: string): SharePayload {
  try {
    let b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const utf8 = atob(b64);
    const json = decodeURIComponent(escape(utf8));
    const minimal = JSON.parse(json) as Minimal;
    return payloadFromMinimal(minimal);
  } catch {
    return {
      data: {
        personal: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "", photo: null, summary: "" },
        experience: [], education: [], skills: [], projects: [], certifications: [], languages: [], publications: [],
      },
      layout: { columns: "one", showPicture: false, picturePosition: "left", primaryColor: "#000000", fontSize: "medium", spacing: "normal" },
      template: "classic-ats",
    };
  }
}

export function buildShareUrl(origin: string, payload: SharePayload): string {
  const encoded = encodeResume(payload);
  // Use a 6-char random prefix for visual variety; the full encoded body follows.
  // base64url alphabet doesn't contain ".", which is our separator.
  const prefix = Math.random().toString(36).slice(2, 8);
  return `${origin}/r/${prefix}.${encoded}`;
}

export function parseShareId(seg: string): string | null {
  // Strip the visual prefix; "." is not in the base64url alphabet, so it can't
  // appear inside the encoded body.
  const idx = seg.indexOf(".");
  if (idx < 0) return null;
  return seg.slice(idx + 1);
}