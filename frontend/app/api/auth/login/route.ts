import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { relayJson, serverApi } from '@/lib/server-api';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const response = await serverApi('/user/login-user', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const { payload, status } = await relayJson(response);

  if (response.ok && payload?.access_token) {
    (await cookies()).set('access_token', payload.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 10,
    });
  }

  return NextResponse.json(payload, { status });
}
