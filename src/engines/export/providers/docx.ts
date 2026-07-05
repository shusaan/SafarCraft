import type { ResumeData } from "@/types";

export async function exportDOCX(data: ResumeData): Promise<Blob> {
  const {
    Document: DocxDocument,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
  } = await import("docx");

  const sections: Paragraph[] = [];

  sections.push(
    new Paragraph({
      children: [new TextRun({ text: data.personal.name || "Your Name", bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
    }),
  );

  const contact = [data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join(" | ");
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

  const doc = new DocxDocument({ sections: [{ children: sections }] });
  const blob = await Packer.toBlob(doc);
  return blob;
}
