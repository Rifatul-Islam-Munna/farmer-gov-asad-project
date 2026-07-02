import { NextRequest, NextResponse } from 'next/server';
import { relayJson, serverApi } from '@/lib/server-api';

export async function GET(request: NextRequest) {
  const response = await serverApi(`/admin/deals${request.nextUrl.search}`);
  const result = await relayJson(response);
  return NextResponse.json(result.payload, { status: result.status });
}
