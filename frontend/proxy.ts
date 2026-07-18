import { NextRequest, NextResponse } from "next/server"

const ACCESS_COOKIE = "agrivision_access"
const BACKEND_URL =
  process.env.BACKEND_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (pathname === "/dashboard/admin/login") return NextResponse.next()

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
  if (!accessToken) return loginRedirect(request)

  try {
    const response = await fetch(`${BACKEND_URL}/user/get-my-profile`, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
    if (!response.ok) return loginRedirect(request, true)
    const payload = await response.json()
    const user = payload?.data
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.role]
    if (!roles.includes("admin") && !roles.includes("superAdmin")) {
      return loginRedirect(request, true)
    }
  } catch {
    return loginRedirect(request)
  }

  return NextResponse.next()
}

function loginRedirect(request: NextRequest, clear = false) {
  const url = request.nextUrl.clone()
  url.pathname = "/dashboard/admin/login"
  url.searchParams.set("from", request.nextUrl.pathname)
  const response = NextResponse.redirect(url)
  if (clear) {
    response.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 })
    response.cookies.set("agrivision_refresh", "", { path: "/api", maxAge: 0 })
    response.cookies.set("agrivision_csrf", "", { path: "/", maxAge: 0 })
  }
  return response
}

export const config = {
  matcher: ["/dashboard/admin/:path*"],
}
