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
