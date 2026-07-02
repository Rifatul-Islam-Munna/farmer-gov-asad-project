import { NextRequest, NextResponse } from 'next/server';
import { relayJson, serverApi } from '@/lib/server-api';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const optional = (value: unknown) => {
    const text = typeof value === 'string' ? value.trim() : '';
    return text || undefined;
  };
  const payload = {
    ...body,
    name: String(body.name || '').trim(),
    phoneNumber: String(body.phoneNumber || '').trim(),
    email: optional(body.email),
    address: optional(body.address),
    businessName: optional(body.businessName),
    shopName: optional(body.shopName),
    landAmount: body.role === 'farmer' ? Number(body.landAmount || 0) : undefined,
    documents: body.role === 'farmer' ? undefined : [],
  };
  const response = await serverApi('/user', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const result = await relayJson(response);
  return NextResponse.json(result.payload, { status: result.status });
}
