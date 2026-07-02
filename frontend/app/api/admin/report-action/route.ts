import { NextRequest, NextResponse } from 'next/server';
import { relayJson, serverApi } from '@/lib/server-api';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const id = String(body.id || '');
  if (!id) {
    return NextResponse.json({ message: 'Report id is required' }, { status: 400 });
  }
  const response = await serverApi('/admin/reports/' + id, {
    method: 'PATCH',
    body: JSON.stringify({ status: body.status, adminNote: body.adminNote }),
  });
  const result = await relayJson(response);
  return NextResponse.json(result.payload, { status: result.status });
}
