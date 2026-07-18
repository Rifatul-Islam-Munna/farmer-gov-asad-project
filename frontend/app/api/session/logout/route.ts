import { NextRequest, NextResponse } from "next/server"

import { BACKEND_URL, backendHeaders, clearSessionCookies, CSRF_COOKIE, sessionCookies } from "@/lib/server-auth"

export async function POST(request: NextRequest) {
  const headerToken = request.headers.get("x-csrf-token")
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return NextResponse.json(
      { success: false, message: "CSRF validation failed" },
      { status: 403 },
    )
  }

  const session = await sessionCookies()
  if (session.accessToken) {
    await fetch(`${BACKEND_URL}/user/logout`, {
      method: "POST",
      headers: backendHeaders(session.accessToken),
      cache: "no-store",
    }).catch(() => undefined)
  }
  const response = NextResponse.json({ success: true })
  clearSessionCookies(response)
  return response
}
