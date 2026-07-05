import { NextResponse } from "next/server";
import { isDbAvailable, db } from "@/db";
import { resumes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  if (!isDbAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 501 });
  }
  try {
    const allResumes = await db.select().from(resumes).orderBy(resumes.updatedAt);
    return NextResponse.json(allResumes);
  } catch {
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDbAvailable()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 501 });
  }
  try {
    const body = await request.json();
    const [resume] = await db
      .insert(resumes)
      .values({
        title: body.title ?? "Untitled Resume",
        data: body.data,
        template: body.template ?? "classic-ats",
        layout: body.layout,
      })
      .returning();
    return NextResponse.json(resume, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 });
  }
}
