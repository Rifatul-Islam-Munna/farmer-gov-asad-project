import { NextRequest, NextResponse } from 'next/server';
import { relayJson, serverApi } from '@/lib/server-api';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  const { id } = await context.params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return NextResponse.json({ message: 'Invalid user id' }, { status: 400 });
  }
  const response = await serverApi(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(await request.json()),
  });
  const result = await relayJson(response);
  return NextResponse.json(result.payload, { status: result.status });
}
