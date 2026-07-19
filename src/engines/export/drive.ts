// Google Drive integration service
// Uses Google Identity Services (GIS) for OAuth 2.0 with drive.file scope

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let accessToken: string | null = null;

function getClientId(): string | null {
  if (typeof window === "undefined") return null;
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? null;
}

export async function authenticate(): Promise<string | null> {
  const clientId = getClientId();
  if (!clientId) return null;

  return new Promise((resolve) => {
    try {
      if (!tokenClient) {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "https://www.googleapis.com/auth/drive.file",
          callback: (response) => {
            if (response.access_token) {
              accessToken = response.access_token;
              resolve(response.access_token);
            } else {
              resolve(null);
            }
          },
        });
      }
      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch {
      resolve(null);
    }
  });
}

export async function saveToDrive(
  content: string,
  fileName: string,
  folderId?: string,
): Promise<{ id: string; name: string } | null> {
  const token = accessToken;
  if (!token) return null;

  try {
    const res = await fetch("/api/drive/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: token, folderId, content, fileName }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function listDriveFiles(): Promise<
  Array<{ id: string; name: string; modifiedTime: string }>
> {
  const token = accessToken;
  if (!token) return [];

  try {
    const res = await fetch(
      "https://www.googleapis.com/drive/v3/files?" +
        new URLSearchParams({
          q: "name contains 'Application_Package'",
          fields: "files(id,name,modifiedTime)",
          orderBy: "modifiedTime desc",
          pageSize: "5",
        }),
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.files ?? [];
  } catch {
    return [];
  }
}
