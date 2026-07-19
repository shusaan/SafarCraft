import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { accessToken, folderId, content, fileName } = await request.json();

    if (!accessToken || !content || !fileName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create a file in Google Drive using the Drive API v3
    const metadata = {
      name: fileName,
      mimeType: "text/plain",
      parents: folderId ? [folderId] : [],
    };

    const form = new FormData();
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
    form.append("metadata", metadataBlob);
    form.append("file", new Blob([content], { type: "text/plain" }));

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
