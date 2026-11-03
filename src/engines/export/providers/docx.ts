import type { ResumeData } from "@/types";
import type { Paragraph as ParagraphType } from "docx";

export async function exportDOCX(data: ResumeData): Promise<Blob> {
  const {
    Document: DocxDocument,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
  } = await import("docx");

  const sections: ParagraphType[] = [];

  sections.push(
    new Paragraph({
      children: [new TextRun({ text: data.personal.name || "Your Name", bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
    }),
  );

  const contact = [
    data.personal.email,
    data.personal.phone,
    data.personal.location,
    data.personal.linkedin,
    data.personal.github,
    data.personal.website,
  ]
    .filter(Boolean)
    .join(" | ");
  if (contact) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: contact, size: 20, color: "666666" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    );
  }

  if (data.personal.summary) {
    sections.push(
      new Paragraph({ children: [new TextRun({ text: "SUMMARY", bold: true, size: 24 })], heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ children: [new TextRun({ text: data.personal.summary, size: 20 })], spacing: { after: 200 } }),
    );
  }

  if (data.experience.length > 0) {
    sections.push(
      new Paragraph({ children: [new TextRun({ text: "EXPERIENCE", bold: true, size: 24 })], heading: HeadingLevel.HEADING_2 }),
    );
    for (const exp of data.experience) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.position} — ${exp.company}`, bold: true, size: 22 }),
            new TextRun({ text: `  ${exp.startDate} – ${exp.current ? "Present" : exp.endDate}`, size: 20, color: "666666" }),
          ],
          spacing: { before: 200 },
        }),
      );
      for (const bullet of exp.bullets.filter(Boolean)) {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: `• ${bullet}`, size: 20 })],
            indent: { left: 400 },
            spacing: { after: 60 },
          }),
        );
      }
    }
  }

  if (data.education.length > 0) {
    sections.push(
      new Paragraph({ children: [new TextRun({ text: "EDUCATION", bold: true, size: 24 })], heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
    );
    for (const edu of data.education) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.degree} in ${edu.field}`, bold: true, size: 22 }),
            new TextRun({ text: `  ${edu.startDate} – ${edu.endDate}`, size: 20, color: "666666" }),
          ],
          spacing: { before: 100 },
        }),
        new Paragraph({ children: [new TextRun({ text: edu.institution, size: 20, color: "666666" })] }),
      );
    }
  }

  if (data.skills.length > 0) {
    sections.push(
      new Paragraph({ children: [new TextRun({ text: "SKILLS", bold: true, size: 24 })], heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
    );
    for (const cat of data.skills) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${cat.category}: `, bold: true, size: 20 }),
            new TextRun({ text: cat.skills.join(", "), size: 20 }),
          ],
          spacing: { after: 60 },
        }),
      );
    }
  }

  if (data.projects.length > 0) {
    sections.push(
      new Paragraph({ children: [new TextRun({ text: "PROJECTS", bold: true, size: 24 })], heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
    );
    for (const project of data.projects) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: project.name, bold: true, size: 22 }),
            project.role ? new TextRun({ text: ` — ${project.role}`, size: 20, color: "666666" }) : new TextRun({ text: "" }),
          ],
          spacing: { before: 100 },
        }),
      );
      if (project.description) {
        sections.push(new Paragraph({ children: [new TextRun({ text: project.description, size: 20 })] }));
      }
      for (const highlight of project.highlights.filter(Boolean)) {
        sections.push(new Paragraph({ children: [new TextRun({ text: `• ${highlight}`, size: 20 })], indent: { left: 400 } }));
      }
      if (project.technologies.length > 0) {
        sections.push(
          new Paragraph({ children: [new TextRun({ text: project.technologies.join(", "), size: 18, color: "666666" })] }),
        );
      }
    }
  }

  if (data.certifications.length > 0) {
    sections.push(
      new Paragraph({ children: [new TextRun({ text: "CERTIFICATIONS", bold: true, size: 24 })], heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
    );
    for (const certification of data.certifications) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: certification.name, bold: true, size: 20 }),
            new TextRun({ text: ` — ${certification.issuer}${certification.date ? ` (${certification.date})` : ""}`, size: 20 }),
          ],
          spacing: { after: 60 },
        }),
      );
    }
  }

  if (data.languages.length > 0) {
    sections.push(
      new Paragraph({ children: [new TextRun({ text: "LANGUAGES", bold: true, size: 24 })], heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
    );
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.languages.map((language) => `${language.language} (${language.proficiency})`).join(", "),
            size: 20,
          }),
        ],
      }),
    );
  }

  if (data.publications.length > 0) {
    sections.push(
      new Paragraph({ children: [new TextRun({ text: "PUBLICATIONS", bold: true, size: 24 })], heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
    );
    for (const publication of data.publications) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: publication.title, bold: true, size: 20 }),
            new TextRun({ text: ` — ${publication.publisher}${publication.date ? ` (${publication.date})` : ""}`, size: 20 }),
          ],
        }),
      );
      if (publication.description) {
        sections.push(new Paragraph({ children: [new TextRun({ text: publication.description, size: 20, color: "666666" })] }));
      }
    }
  }

  const doc = new DocxDocument({ sections: [{ children: sections }] });
  const blob = await Packer.toBlob(doc);
  return blob;
}
