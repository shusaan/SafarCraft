import { NextResponse } from "next/server";
import { isDbAvailable, db } from "@/db";
import { resumes, resumeVersions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 501 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const [resume] = await db
      .update(resumes)
      .set({
        data: body.data,
        template: body.template,
        layout: body.layout,
        atsScore: body.atsScore,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, id))
      .returning();
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    return NextResponse.json(resume);
  } catch {
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 501 });
  }
  try {
    const { id } = await params;
    await db.delete(resumes).where(eq(resumes.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 501 });
  }
  try {
    const { id } = await params;
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    const versions = await db
      .select()
      .from(resumeVersions)
      .where(eq(resumeVersions.resumeId, id))
      .orderBy(resumeVersions.version);

    const [version] = await db
      .insert(resumeVersions)
      .values({
        resumeId: id,
        data: resume.data,
        atsScore: resume.atsScore,
        version: versions.length + 1,
      })
      .returning();
    return NextResponse.json(version, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 });
  }
}
