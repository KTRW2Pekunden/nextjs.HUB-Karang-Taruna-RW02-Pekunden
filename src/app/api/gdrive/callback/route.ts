import { NextResponse } from "next/server";
import { google } from "googleapis";

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code provided" });

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  const { tokens } = await oAuth2Client.getToken(code);
  if (!tokens.refresh_token) {
    return NextResponse.json({ error: "No refresh token received" });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const response = NextResponse.redirect(`${baseUrl}/`);
  response.cookies.set({
    name: "gdrive_refresh_token",
    value: tokens.refresh_token,
    httpOnly: false,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
};
