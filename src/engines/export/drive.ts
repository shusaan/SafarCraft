// Google Drive integration service
// Uses Google Identity Services (GIS) for OAuth 2.0 with drive.file scope

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let accessToken: string | null = null;
let pickerLoaded = false;

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

function loadPickerApi(): Promise<void> {
  return new Promise((resolve) => {
    if (pickerLoaded) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      gapi.load("picker", () => {
        pickerLoaded = true;
        resolve();
      });
    };
    document.body.appendChild(script);
  });
}

export async function pickFolder(): Promise<string | null> {
  const token = await authenticate();
  if (!token) return null;

  await loadPickerApi();

  return new Promise((resolve) => {
    const picker = new gapi.picker.PickerBuilder()
      .addView(new gapi.picker.DocsView().setIncludeFolders(true).setMimeTypes("application/vnd.google-apps.folder").setSelectFolderEnabled(true))
      .setOAuthToken(token)
      .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? "")
      .setCallback((data) => {
        if (data.action === gapi.picker.Action.PICKED) {
          const doc = data.docs[0];
          resolve(doc ? doc.id : null);
        } else {
          resolve(null);
        }
      })
      .build();
    picker.setVisible(true);
  });
}

export async function saveToDrive(
  content: string,
  fileName: string,
  mimeType = "text/plain",
  folderId?: string,
): Promise<{ id: string; name: string } | null> {
  const token = accessToken;
  if (!token) return null;

  try {
    const res = await fetch("/api/drive/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: token, folderId, content, fileName, mimeType }),
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
