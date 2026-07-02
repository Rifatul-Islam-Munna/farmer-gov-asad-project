'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: form.get('phoneNumber'), password: form.get('password') }),
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) return setError(payload.message || 'Login failed');
    if (payload.user?.role !== 'admin') {
      await fetch('/api/auth/signout', { method: 'POST' });
      return setError('This workspace is available to administrators only.');
    }
    router.replace('/admin');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Administrator sign in</CardTitle>
          <CardDescription>Use the administrator email or phone and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-1.5"><Label htmlFor="phoneNumber">Email or phone</Label><Input id="phoneNumber" name="phoneNumber" required autoComplete="username" /></div>
            <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required autoComplete="current-password" /></div>
            {error ? <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
            <Button className="w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500">Public user registration is available on the <Link className="text-emerald-700 hover:underline" href="/signup">sign-up page</Link>.</p>
        </CardContent>
      </Card>
    </main>
  );
}
