import { NextResponse } from "next/server"

import { BACKEND_URL, backendHeaders, clearSessionCookies, sessionCookies } from "@/lib/server-auth"

export async function GET() {
  const session = await sessionCookies()
  if (!session.accessToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  const backend = await fetch(`${BACKEND_URL}/user/get-my-profile`, {
    headers: backendHeaders(session.accessToken),
    cache: "no-store",
  })
  const payload = await backend.json().catch(() => ({}))
  if (!backend.ok) {
    const response = NextResponse.json(
      { authenticated: false, ...payload },
      { status: backend.status },
    )
    if (backend.status === 401) clearSessionCookies(response)
    return response
  }
  return NextResponse.json({ authenticated: true, user: payload.data })
}
