'use client';

import { FormEvent, useState } from 'react';
import { PostRequestAxios } from '@/api-hooks/api-hooks';
import { AdminShell } from '@/components/admin-shell';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Textarea } from '@/components/ui';

export default function Page() {
  const [status, setStatus] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await PostRequestAxios('/admin/guidance', Object.fromEntries(form));
    setStatus(result[1]?.message || 'Guidance published.');
    if (!result[1]) event.currentTarget.reset();
  }
  return <AdminShell user={{ name: 'Administrator' }}>
    <h1 className="text-2xl font-semibold">Guidance publisher</h1>
    <p className="mb-6 text-sm text-slate-500">Publish role-specific notices and suggestions.</p>
    <Card className="max-w-2xl"><CardHeader><CardTitle>New guidance</CardTitle></CardHeader><CardContent>
      <form className="space-y-4" onSubmit={submit}>
        <div><Label>Title</Label><Input name="title" required /></div>
        <div><Label>Message</Label><Textarea name="message" required /></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><Label>Type</Label><Select name="type"><option value="notice">Notice</option><option value="suggestion">Suggestion</option></Select></div><div><Label>Audience</Label><Select name="targetRole"><option value="all">All roles</option><option value="farmer">Farmers</option><option value="buyer">Buyers</option><option value="agent">Agents</option><option value="medicineSeller">Medicine sellers</option></Select></div></div>
        <input type="hidden" name="active" value="true" />
        {status ? <p className="text-sm text-slate-600">{status}</p> : null}
        <Button>Publish guidance</Button>
      </form>
    </CardContent></Card>
  </AdminShell>;
}
