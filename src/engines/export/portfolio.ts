import type { ResumeData } from "@/types";

export function generatePersonalWebsite(data: ResumeData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.personal.name} — Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-900">
  <div class="mx-auto max-w-3xl px-4 py-16">
    <header class="mb-12 text-center">
      <h1 class="text-4xl font-bold">${data.personal.name}</h1>
      <p class="mt-2 text-xl text-gray-600">${data.personal.summary ? data.personal.summary.split(".")[0] : ""}</p>
      <div class="mt-4 flex justify-center gap-4 text-sm">
        ${data.personal.email ? `<a href="mailto:${data.personal.email}" class="text-blue-600 hover:underline">${data.personal.email}</a>` : ""}
        ${data.personal.github ? `<a href="${data.personal.github}" class="text-blue-600 hover:underline">GitHub</a>` : ""}
        ${data.personal.linkedin ? `<a href="${data.personal.linkedin}" class="text-blue-600 hover:underline">LinkedIn</a>` : ""}
      </div>
    </header>
    ${generateExperienceHTML(data)}
    ${generateEducationHTML(data)}
    ${generateSkillsHTML(data)}
    ${generateProjectsHTML(data)}
  </div>
</body>
</html>`;
}

export function generateGitHubReadme(data: ResumeData): string {
  const lines: string[] = [];

  lines.push(`# ${data.personal.name}`);
  lines.push("");
  if (data.personal.summary) lines.push(data.personal.summary, "");
  lines.push("## Skills");
  lines.push("");
  for (const cat of data.skills) {
    lines.push(`- **${cat.category}**: ${cat.skills.join(", ")}`);
  }
  lines.push("");
  lines.push("## Experience");
  lines.push("");
  for (const exp of data.experience) {
    lines.push(`- **${exp.position}** at ${exp.company} (${exp.startDate} - ${exp.current ? "Present" : exp.endDate})`);
  }
  lines.push("");
  lines.push("## Connect");
  lines.push("");
  if (data.personal.email) lines.push(`- Email: ${data.personal.email}`);
  if (data.personal.linkedin) lines.push(`- LinkedIn: ${data.personal.linkedin}`);
  if (data.personal.website) lines.push(`- Website: ${data.personal.website}`);

  return lines.join("\n");
}

export function generateShortBio(data: ResumeData): string {
  const role = data.experience[0]?.position ?? "Software Engineer";
  const company = data.experience[0]?.company ?? "";
  const topSkills = data.skills.flatMap((c) => c.skills).slice(0, 5);

  let bio = `${data.personal.name} — ${role}`;
  if (company) bio += ` at ${company}`;
  bio += `. ${data.personal.summary ? data.personal.summary.split(".")[0] : ""}`;
  if (topSkills.length > 0) bio += ` Skilled in ${topSkills.join(", ")}.`;
  return bio;
}

// Helper HTML generators
function generateExperienceHTML(data: ResumeData): string {
  if (data.experience.length === 0) return "";
  return `<section class="mb-12">
    <h2 class="mb-6 text-2xl font-bold">Experience</h2>
    ${data.experience.map((exp) => `
      <div class="mb-6">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold">${exp.position}</h3>
            <p class="text-gray-600">${exp.company}${exp.location ? ` — ${exp.location}` : ""}</p>
          </div>
          <p class="text-sm text-gray-500">${exp.startDate} – ${exp.current ? "Present" : exp.endDate}</p>
        </div>
        ${exp.bullets.filter(Boolean).length > 0 ? `<ul class="mt-2 list-disc pl-5 text-gray-700">${exp.bullets.filter(Boolean).map((b) => `<li>${b}</li>`).join("")}</ul>` : ""}
      </div>`).join("")}
  </section>`;
}

function generateEducationHTML(data: ResumeData): string {
  if (data.education.length === 0) return "";
  return `<section class="mb-12">
    <h2 class="mb-6 text-2xl font-bold">Education</h2>
    ${data.education.map((edu) => `
      <div class="mb-4">
        <h3 class="text-lg font-semibold">${edu.degree} in ${edu.field}</h3>
        <p class="text-gray-600">${edu.institution} — ${edu.startDate} to ${edu.endDate}</p>
        ${edu.gpa ? `<p class="text-gray-500">GPA: ${edu.gpa}</p>` : ""}
      </div>`).join("")}
  </section>`;
}

function generateSkillsHTML(data: ResumeData): string {
  if (data.skills.length === 0) return "";
  return `<section class="mb-12">
    <h2 class="mb-6 text-2xl font-bold">Skills</h2>
    <div class="grid grid-cols-2 gap-4">
      ${data.skills.map((cat) => `
        <div>
          <h3 class="font-semibold">${cat.category}</h3>
          <p class="text-gray-600">${cat.skills.join(", ")}</p>
        </div>`).join("")}
    </div>
  </section>`;
}

function generateProjectsHTML(data: ResumeData): string {
  if (data.projects.length === 0) return "";
  return `<section class="mb-12">
    <h2 class="mb-6 text-2xl font-bold">Projects</h2>
    ${data.projects.map((proj) => `
      <div class="mb-4">
        <h3 class="text-lg font-semibold">${proj.name}</h3>
        <p class="text-gray-600">${proj.description}</p>
        ${proj.highlights.filter(Boolean).length > 0 ? `<ul class="mt-1 list-disc pl-5 text-gray-700">${proj.highlights.filter(Boolean).map((h) => `<li>${h}</li>`).join("")}</ul>` : ""}
      </div>`).join("")}
  </section>`;
}

export function generateLandingPage(data: ResumeData): string {
  const role = data.experience[0]?.position ?? "Software Engineer";
  const topSkills = data.skills.flatMap((c) => c.skills).slice(0, 6);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.personal.name} -- Developer Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
  <div class="mx-auto max-w-4xl px-4 py-20">
    <div class="text-center">
      <h1 class="text-5xl font-bold tracking-tight">${data.personal.name}</h1>
      <p class="mt-3 text-xl text-gray-600">${role}</p>
      <div class="mt-6 flex justify-center gap-4">
        ${data.personal.email ? `<a href="mailto:${data.personal.email}" class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">Email Me</a>` : ""}
        ${data.personal.github ? `<a href="${data.personal.github}" class="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100">GitHub</a>` : ""}
        ${data.personal.linkedin ? `<a href="${data.personal.linkedin}" class="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100">LinkedIn</a>` : ""}
      </div>
    </div>
    ${data.personal.summary ? `<div class="mx-auto mt-16 max-w-2xl text-center"><p class="text-lg text-gray-600">${data.personal.summary}</p></div>` : ""}
    ${topSkills.length > 0 ? `<div class="mx-auto mt-16 max-w-xl"><h2 class="text-center text-sm font-semibold uppercase tracking-widest text-gray-500">Skills</h2><div class="mt-4 flex flex-wrap justify-center gap-2">${topSkills.map((s) => `<span class="rounded-full bg-gray-200 px-4 py-1.5 text-sm">${s}</span>`).join("")}</div></div>` : ""}
    ${data.experience.length > 0 ? `<div class="mx-auto mt-16 max-w-2xl"><h2 class="text-sm font-semibold uppercase tracking-widest text-gray-500">Experience</h2>${data.experience.slice(0, 3).map((exp) => `<div class="mt-4 border-l-2 border-gray-300 pl-4"><h3 class="font-semibold">${exp.position}</h3><p class="text-sm text-gray-600">${exp.company} &middot; ${exp.startDate} -- ${exp.current ? "Present" : exp.endDate}</p></div>`).join("")}</div>` : ""}
    <footer class="mt-20 text-center text-sm text-gray-400">Generated by CareerForge AI</footer>
  </div>
</body>
</html>`;
}
