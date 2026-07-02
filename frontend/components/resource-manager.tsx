'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useQueryWrapper } from '@/api-hooks/react-query-wrapper';
import { PatchRequestAxios, PostRequestAxios } from '@/api-hooks/api-hooks';
import { AdminShell } from '@/components/admin-shell';
import { Button, Card, CardContent, Input, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';

const settings = {
  users: { title: 'Users', fields: ['name', 'phoneNumber', 'role', 'verificationStatus', 'isActive'], options: ['pending', 'approved', 'rejected'] },
  listings: { title: 'Listings', fields: ['goodName', 'goodCode', 'quantity', 'marketPrice', 'status'], options: ['published', 'reserved', 'sold', 'cancelled', 'rejected'] },
  deals: { title: 'Deals', fields: ['listingId', 'buyerId', 'farmerId', 'totalPrice', 'status'], options: ['confirmed', 'completed', 'cancelled', 'disputed'] },
  reports: { title: 'Reports', fields: ['subject', 'targetType', 'reporterId', 'createdAt', 'status'], options: ['open', 'reviewing', 'resolved', 'rejected'] },
} as const;

type Kind = keyof typeof settings;
type PageData = { data: Array<Record<string, unknown>>; meta?: { total: number } };

export function ResourceManager({ kind }: { kind: Kind }) {
  const [search, setSearch] = useState('');
  const client = useQueryClient();
  const config = settings[kind];
  const endpoint = `/admin/${kind}?limit=50&search=${encodeURIComponent(search)}`;
  const query = useQueryWrapper<PageData>(['admin', kind, search], endpoint);

  const action = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const result = kind === 'reports'
        ? await PostRequestAxios('/admin/report-action', { id, ...payload })
        : await PatchRequestAxios(`/admin/${kind}/${id}`, payload);
      if (result[1]) throw new Error(result[1].message);
      return result[0];
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', kind] }),
  });

  function controls(row: Record<string, unknown>) {
    const id = String(row._id);
    if (kind === 'users') return <div className="flex min-w-80 gap-2">
      <Select value={String(row.verificationStatus)} onChange={(event) => action.mutate({ id, payload: { verificationStatus: event.target.value } })}>{settings.users.options.map((value) => <option key={value}>{value}</option>)}</Select>
      <Select value={String(row.role)} onChange={(event) => action.mutate({ id, payload: { role: event.target.value } })}><option value="farmer">farmer</option><option value="buyer">buyer</option><option value="agent">agent</option><option value="medicineSeller">medicine seller</option><option value="admin">admin</option></Select>
      <Button size="sm" variant={row.isActive === false ? 'default' : 'destructive'} onClick={() => action.mutate({ id, payload: { isActive: row.isActive === false } })}>{row.isActive === false ? 'Activate' : 'Suspend'}</Button>
    </div>;
    return <Select value={String(row.status || '')} onChange={(event) => action.mutate({ id, payload: { status: event.target.value } })}>{config.options.map((value) => <option key={value}>{value}</option>)}</Select>;
  }

  return <AdminShell user={{ name: 'Administrator' }}>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-2xl font-semibold">{config.title}</h1><p className="text-sm text-slate-500">Search, review and update platform records.</p></div>
      <Input className="max-w-xs" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${kind}`} />
    </div>
    <Card><CardContent className="p-0">
      {query.isError ? <p className="p-5 text-sm text-red-700">{query.error.message}</p> : null}
      <Table><TableHeader><TableRow>{config.fields.map((field) => <TableHead key={field}>{field}</TableHead>)}<TableHead>Controls</TableHead></TableRow></TableHeader>
        <TableBody>{(query.data?.data || []).map((row) => <TableRow key={String(row._id)}>{config.fields.map((field) => <TableCell key={field}>{String(row[field] ?? '—')}</TableCell>)}<TableCell>{controls(row)}</TableCell></TableRow>)}</TableBody>
      </Table>
      {!query.isLoading && !query.data?.data.length ? <p className="p-8 text-center text-sm text-slate-500">No records found.</p> : null}
      {action.isError ? <p className="p-3 text-sm text-red-700">{action.error.message}</p> : null}
    </CardContent></Card>
    <Button variant="outline" size="sm" className="mt-4" onClick={() => query.refetch()}>Refresh</Button>
  </AdminShell>;
}
