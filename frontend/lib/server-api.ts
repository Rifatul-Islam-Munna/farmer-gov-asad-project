import 'server-only';

import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:4000';

export async function serverApi(path: string, init?: RequestInit) {
  const token = (await cookies()).get('access_token')?.value;
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');
  if (!headers.has('content-type')) headers.set('content-type', 'application/json');
  if (token) headers.set('access_token', token);

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
}

export async function relayJson(response: Response) {
  const payload = await response.json().catch(() => ({ message: 'Invalid API response' }));
  return { payload, status: response.status };
}
