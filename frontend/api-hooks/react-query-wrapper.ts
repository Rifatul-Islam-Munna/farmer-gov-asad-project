'use client';

import { useQuery } from '@tanstack/react-query';
import { GetRequestNormal } from './api-hooks';

export function useQueryWrapper<T>(key: string[], url: string) {
  return useQuery({
    queryKey: key,
    queryFn: () => GetRequestNormal<T>(url),
  });
}
