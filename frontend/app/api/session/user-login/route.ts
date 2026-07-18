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
  if (!backend.ok) return NextResponse.json(payload, { status: backend.status })

  const response = NextResponse.json({ success: true, user: payload.user })
  setSessionCookies(
    response,
    payload.access_token,
    payload.refresh_token,
    randomBytes(32).toString("hex"),
  )
  return response
}
