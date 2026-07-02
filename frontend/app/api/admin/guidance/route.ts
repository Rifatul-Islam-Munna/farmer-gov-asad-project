import { NextRequest, NextResponse } from 'next/server';
import { relayJson, serverApi } from '@/lib/server-api';

export async function POST(request: NextRequest) {
  const response = await serverApi('/admin/guidance', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
  const result = await relayJson(response);
  return NextResponse.json(result.payload, { status: result.status });
}
