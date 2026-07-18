import { NextRequest, NextResponse } from "next/server"
import { ACCESS_COOKIE, BACKEND_URL } from "@/lib/server-auth"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
  if (!accessToken) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 })
  }
  const response = await fetch(`${BACKEND_URL}/billing/orders/${encodeURIComponent(id)}/invoice`, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  if (!response.ok) {
    return NextResponse.json(
      await response.json().catch(() => ({ message: "Could not generate invoice" })),
      { status: response.status },
    )
  }
  return new NextResponse(response.body, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": response.headers.get("content-disposition") ?? `inline; filename="invoice-${id}.pdf"`,
      "cache-control": "private, no-store",
    },
  })
}
