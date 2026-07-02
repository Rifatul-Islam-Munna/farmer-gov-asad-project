import Link from 'next/link';
import { AdminShell } from '@/components/admin-shell';
import { Card, CardContent } from '@/components/ui';

const sections = [
  ['/admin/users', 'Users', 'Approve, suspend and review accounts'],
  ['/admin/listings', 'Listings', 'Moderate marketplace inventory'],
  ['/admin/deals', 'Deals', 'Control transaction states'],
  ['/admin/reports', 'Reports', 'Review platform-wide reports'],
  ['/admin/guidance', 'Guidance', 'Publish notices and suggestions'],
] as const;

export default function Page() {
  return <AdminShell user={{ name: 'Administrator' }}>
    <h1 className="text-2xl font-semibold">Platform overview</h1>
    <p className="mb-6 text-sm text-slate-500">Central control center for the farmer platform.</p>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sections.map(([href, title, description]) => <Link href={href} key={href}><Card className="h-full transition hover:border-emerald-300"><CardContent className="pt-5"><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></CardContent></Card></Link>)}
    </div>
  </AdminShell>;
}
