'use client';

import { useQueryWrapper } from '@/api-hooks/react-query-wrapper';
import { Card, CardContent } from '@/components/ui';
import type { DashboardResponse } from '@/lib/types';

const labels: Record<string, string> = {
  totalUsers: 'Total users',
  activeUsers: 'Active users',
  pendingUsers: 'Pending approval',
  totalListings: 'Listings',
  publishedListings: 'Published',
  totalDeals: 'Deals',
  openReports: 'Open reports',
  grossMarketValue: 'Market value',
};

export function DashboardMetrics() {
  const query = useQueryWrapper<DashboardResponse>(['admin-dashboard'], '/admin/dashboard');
  if (query.isLoading) return <p className="text-sm text-slate-500">Loading metrics…</p>;
  if (query.isError) return <p className="text-sm text-red-700">{query.error.message}</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Object.entries(query.data?.data.metrics ?? {}).map(([key, value]) => (
        <Card key={key}>
          <CardContent className="pt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{labels[key] ?? key}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {key === 'grossMarketValue' ? `৳${Number(value).toLocaleString()}` : Number(value).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
