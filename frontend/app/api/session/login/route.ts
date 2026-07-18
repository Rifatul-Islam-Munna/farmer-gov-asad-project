import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"

import { BACKEND_URL, setSessionCookies } from "@/lib/server-auth"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const backend = await fetch(`${BACKEND_URL}/user/login-user`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  const payload = await backend.json().catch(() => ({}))
  if (!backend.ok) {
    return NextResponse.json(payload, { status: backend.status })
  }

  const role = payload?.user?.role
  const roles = Array.isArray(payload?.user?.roles) ? payload.user.roles : [role]
  if (!roles.includes("admin") && !roles.includes("superAdmin")) {
    return NextResponse.json(
      { success: false, message: "Administrator access is required" },
      { status: 403 },
    )
  }

  const response = NextResponse.json({
    success: true,
    user: payload.user,
  })
  setSessionCookies(
    response,
    payload.access_token,
    payload.refresh_token,
    randomBytes(32).toString("hex"),
  )
  return response
}
