import { NextRequest, NextResponse } from 'next/server';
import { relayJson, serverApi } from '@/lib/server-api';

export async function POST(request: NextRequest) {
  const response = await serverApi('/user', {
    method: 'POST',
    body: JSON.stringify(await request.json()),
  });
  const { payload, status } = await relayJson(response);
  return NextResponse.json(payload, { status });
}
