// Google Drive integration service
// Uses Google Identity Services (GIS) for OAuth 2.0 with the privacy-friendly
// drive.file scope: SafarCraft can only see and edit the files it created
// itself. All files live in one dedicated "SafarCraft" folder (find-or-create).

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let accessToken: string | null = null;

function getClientId(): string | null {
  if (typeof window === "undefined") return null;
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? null;
}

/** Whether this instance has a Google OAuth client id configured. */
export function isDriveConfigured(): boolean {
  return !!getClientId();
}

/** Prompt for consent once per session; reuse the cached token afterwards. */
export async function authenticate(): Promise<string | null> {
  if (accessToken) return accessToken;

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

export interface DriveFolder {
  id: string;
  name: string;
}

export interface DriveFileMeta {
  id: string;
  name: string;
  modifiedTime?: string;
}

async function driveFetch(url: string, init?: RequestInit): Promise<Response | null> {
  const token = accessToken;
  if (!token) return null;
  try {
    return await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
    });
  } catch {
    return null;
  }
}

/**
 * Find the dedicated SafarCraft folder, creating it if it doesn't exist.
 * The drive.file scope only returns files this app created — which is
 * exactly the folder we manage — so the search is privacy-safe.
 */
export async function findOrCreateFolder(name = "SafarCraft"): Promise<DriveFolder | null> {
  const params = new URLSearchParams({
    q: `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id,name)",
    pageSize: "1",
  });
  const search = await driveFetch(`https://www.googleapis.com/drive/v3/files?${params}`);
  if (search?.ok) {
    const data = (await search.json().catch(() => null)) as { files?: DriveFolder[] } | null;
    const found = data?.files?.[0];
    if (found?.id) return { id: found.id, name: found.name ?? name };
  }

  const create = await driveFetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder" }),
  });
  if (!create?.ok) return null;
  const folder = (await create.json().catch(() => null)) as DriveFolder | null;
  return folder?.id ? { id: folder.id, name: folder.name ?? name } : null;
}

/** List files inside a folder (newest first), optionally filtered by mime type. */
export async function listFilesInFolder(folderId: string, mimeType?: string): Promise<DriveFileMeta[]> {
  const clauses = [`'${folderId}' in parents`, "trashed = false"];
  if (mimeType) clauses.push(`mimeType = '${mimeType}'`);
  const params = new URLSearchParams({
    q: clauses.join(" and "),
    fields: "files(id,name,modifiedTime)",
    orderBy: "modifiedTime desc",
    pageSize: "10",
  });
  const res = await driveFetch(`https://www.googleapis.com/drive/v3/files?${params}`);
  if (!res?.ok) return [];
  const data = (await res.json().catch(() => null)) as { files?: DriveFileMeta[] } | null;
  return data?.files ?? [];
}

/** Download a file's text content. */
export async function downloadFileContent(fileId: string): Promise<string | null> {
  const res = await driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
  if (!res?.ok) return null;
  try {
    return await res.text();
  } catch {
    return null;
  }
}

/** Upload a file through the server-side proxy route. */
export async function saveToDrive(
  content: string,
  fileName: string,
  mimeType = "text/plain",
  folderId?: string,
  isBase64 = false,
): Promise<{ id: string; name: string } | null> {
  const token = accessToken;
  if (!token) return null;

  try {
    const res = await fetch("/api/drive/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: token, folderId, content, fileName, mimeType, isBase64 }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
