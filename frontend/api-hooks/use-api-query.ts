"use client"

import {
  QueryKey,
  UseQueryOptions,
  useQuery,
} from "@tanstack/react-query"
import { apiGet } from "./api-client"

export function useApiQuery<TData>(
  queryKey: QueryKey,
  url: string,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: ({ signal }) => apiGet<TData>(url, signal),
    ...options,
  })
}
