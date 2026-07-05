import { NextResponse } from "next/server";
import { db } from "@/db";
import { resumeVersions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const versions = await db
      .select()
      .from(resumeVersions)
      .where(eq(resumeVersions.resumeId, id))
      .orderBy(desc(resumeVersions.version));
    return NextResponse.json(versions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}
