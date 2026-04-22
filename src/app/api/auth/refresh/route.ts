import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL ?? "https://ecocomply.ddns.net";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: "missing refresh token" },
      { status: 401 }
    );
  }

  const backendRes = await fetch(`${BACKEND}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-Client-Type": "mobile",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    const response = NextResponse.json(data, { status: backendRes.status });
    // Clear invalid cookies
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  const { access_token, refresh_token } = data.data;

  const response = NextResponse.json({ success: true });

  response.cookies.set("access_token", access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  response.cookies.set("refresh_token", refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/api/auth/refresh",
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}