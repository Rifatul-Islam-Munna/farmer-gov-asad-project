import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const BACKEND_URL =
  process.env.BACKEND_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000"

export const ACCESS_COOKIE = "agrivision_access"
export const REFRESH_COOKIE = "agrivision_refresh"
export const CSRF_COOKIE = "agrivision_csrf"

const secure = process.env.NODE_ENV === "production"

export function setSessionCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  csrfToken: string,
) {
  response.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 10 * 24 * 60 * 60,
  })
  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/api",
    maxAge: 30 * 24 * 60 * 60,
  })
  response.cookies.set(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  })
}

export function clearSessionCookies(response: NextResponse) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, CSRF_COOKIE]) {
    response.cookies.set(name, "", {
      httpOnly: name !== CSRF_COOKIE,
      secure,
      sameSite: "strict",
      path: name === REFRESH_COOKIE ? "/api" : "/",
      maxAge: 0,
    })
  }
}

export async function sessionCookies() {
  const store = await cookies()
  return {
    accessToken: store.get(ACCESS_COOKIE)?.value,
    refreshToken: store.get(REFRESH_COOKIE)?.value,
    csrfToken: store.get(CSRF_COOKIE)?.value,
  }
}

export function backendHeaders(accessToken?: string, headers?: HeadersInit) {
  return {
    "content-type": "application/json",
    ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
    ...Object.fromEntries(new Headers(headers).entries()),
  }
}
