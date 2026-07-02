import { NextRequest, NextResponse } from 'next/server';
import { relayJson, serverApi } from '@/lib/server-api';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Context) {
  const { id } = await params;
  const response = await serverApi(`/admin/listings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(await request.json()),
  });
  const result = await relayJson(response);
  return NextResponse.json(result.payload, { status: result.status });
}
