'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from '@/components/ui';

export default function SignupPage() {
  const [status, setStatus] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();
    setStatus(response.ok ? 'Registration submitted successfully.' : data.message || 'Registration failed.');
  }
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Create account</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <div><Label>Name</Label><Input name="name" required /></div>
            <div><Label>Phone</Label><Input name="phoneNumber" required /></div>
            <div><Label>Email</Label><Input name="email" type="email" /></div>
            <div><Label>Password</Label><Input name="password" type="password" minLength={6} required /></div>
            <div><Label>Role</Label><Select name="role"><option value="farmer">Farmer</option><option value="buyer">Buyer</option><option value="agent">Agent</option><option value="medicineSeller">Medicine seller</option></Select></div>
            <div><Label>Land amount</Label><Input name="landAmount" type="number" min="0" step="0.01" /></div>
            <div><Label>Business name</Label><Input name="businessName" /></div>
            <div><Label>Shop name</Label><Input name="shopName" /></div>
            <div><Label>Address</Label><Input name="address" /></div>
            {status ? <p className="text-sm text-slate-600">{status}</p> : null}
            <Button className="w-full">Register</Button>
          </form>
          <p className="mt-4 text-center text-sm"><Link className="text-emerald-700" href="/login">Back to sign in</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}
