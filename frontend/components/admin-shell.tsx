'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

const items = [
  ['/admin', 'Overview'],
  ['/admin/users', 'Users'],
  ['/admin/listings', 'Listings'],
  ['/admin/deals', 'Deals'],
  ['/admin/reports', 'Reports'],
  ['/admin/guidance', 'Guidance'],
] as const;

export function AdminShell(props: {
  user: { name: string; email?: string; phoneNumber?: string };
  children: React.ReactNode;
}) {
  const router = useRouter();
  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.replace('/login');
  }
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-4">
        <h1 className="mb-1 font-semibold">Farmer Gov Admin</h1>
        <p className="mb-5 text-xs text-slate-500">{props.user.name}</p>
        <nav className="flex gap-1 overflow-auto lg:flex-col">
          {items.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700">{label}</Link>
          ))}
        </nav>
        <Button className="mt-5 w-full" variant="outline" size="sm" onClick={signOut}>Sign out</Button>
      </aside>
      <main className="min-w-0 p-4 sm:p-6 lg:p-8">{props.children}</main>
    </div>
  );
}
