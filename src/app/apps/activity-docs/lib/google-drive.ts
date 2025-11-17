import { google } from "googleapis";
import { cookies } from "next/headers";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function getOAuth2Client() {
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("gdrive_refresh_token")?.value;

  if (refreshToken) {
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
  }

  return oAuth2Client;
}

export async function getDriveClient() {
  const auth = await getOAuth2Client();
  return google.drive({ version: "v3", auth });
}

export async function getOrCreateFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId: string
): Promise<string> {
  const query = `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const res = await drive.files.list({ q: query, fields: "files(id)" });
  const existingFolder = res.data.files?.[0]?.id;
  if (existingFolder) return existingFolder;

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });

  if (!folder.data.id) throw new Error("Failed to create folder");
  return folder.data.id;
}
