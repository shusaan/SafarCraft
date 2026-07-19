import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { accessToken, folderId, content, fileName, mimeType = "text/plain", isBase64 = false } = await request.json();

    if (!accessToken || !content || !fileName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const metadata = {
      name: fileName,
      mimeType,
      parents: folderId ? [folderId] : [],
    };

    const fileBlob = isBase64
      ? new Blob([Uint8Array.from(atob(content as string), (c) => c.charCodeAt(0))])
      : new Blob([content as string], { type: "text/plain" });

    const form = new FormData();
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
    form.append("metadata", metadataBlob);
    form.append("file", fileBlob);

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      },
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Drive API error: ${error}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ id: data.id, name: data.name });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save to Drive" },
      { status: 500 },
    );
  }
}
