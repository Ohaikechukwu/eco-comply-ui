import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL ?? "https://ecocomply.ddns.net";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "missing token" },
      { status: 401 }
    );
  }

  const backendRes = await fetch(`${BACKEND}/api/v1/auth/profile`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "X-Client-Type": "mobile",
    },
  });

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}