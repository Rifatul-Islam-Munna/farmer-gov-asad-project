import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"

import {
  BACKEND_URL,
  backendHeaders,
  clearSessionCookies,
  CSRF_COOKIE,
  sessionCookies,
  setSessionCookies,
} from "@/lib/server-auth"

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"])

async function handler(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params
  const session = await sessionCookies()
  if (!session.accessToken) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    )
  }

  if (MUTATING.has(request.method)) {
    const headerToken = request.headers.get("x-csrf-token")
    const cookieToken = request.cookies.get(CSRF_COOKIE)?.value
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return NextResponse.json(
        { success: false, message: "CSRF validation failed" },
        { status: 403 },
      )
    }
  }

  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.text()
  const target = `${BACKEND_URL}/${path.join("/")}${request.nextUrl.search}`
  let backend = await fetch(target, {
    method: request.method,
    headers: backendHeaders(session.accessToken, request.headers),
    body,
    cache: "no-store",
  })

  let rotated:
    | { access_token: string; refresh_token: string }
    | undefined
  if (backend.status === 401 && session.refreshToken) {
    const refresh = await fetch(`${BACKEND_URL}/user/refresh-token`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
      cache: "no-store",
    })
    if (refresh.ok) {
      const refreshed = (await refresh.json()) as {
        access_token: string
        refresh_token: string
      }
      rotated = refreshed
      backend = await fetch(target, {
        method: request.method,
        headers: backendHeaders(refreshed.access_token, request.headers),
        body,
        cache: "no-store",
      })
    }
  }

  const responseBody = await backend.text()
  const response = new NextResponse(responseBody, {
    status: backend.status,
    headers: {
      "content-type": backend.headers.get("content-type") ?? "application/json",
    },
  })
  if (rotated) {
    setSessionCookies(
      response,
      rotated.access_token,
      rotated.refresh_token,
      session.csrfToken ?? randomBytes(32).toString("hex"),
    )
  }
  if (backend.status === 401) clearSessionCookies(response)
  return response
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
