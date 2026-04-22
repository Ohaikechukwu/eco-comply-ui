import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "https://ecocomply.ddns.net";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const backendRes = await fetch(`${BACKEND}/api/v1/auth/login`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-Client-Type": "mobile", // get tokens in body
    },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const { tokens, user, org } = data.data;

  // Set httpOnly cookies from Next.js server — same domain as frontend
  const response = NextResponse.json({
    success: true,
    message: "login successful",
    data: { user, org }, // don't expose tokens to client JS
  });

  response.cookies.set("access_token", tokens.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",  // lax works because same domain now
    path: "/",
    maxAge: 60 * 15,  // 15 minutes
  });

  response.cookies.set("refresh_token", tokens.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/api/auth/refresh",
    maxAge: 60 * 60 * 24 * 14,  // 14 days
  });

  return response;
}