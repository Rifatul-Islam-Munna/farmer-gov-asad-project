'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DeleteRequestAxios,
  PatchRequestAxios,
  PostRequestAxios,
} from './api-hooks';

type Method = 'POST' | 'PATCH' | 'DELETE';

type Config<TData> = {
  url: string | ((variables: unknown) => string);
  method: Method;
  invalidate?: string[][];
  successMessage?: string;
  onSuccess?: (data: TData) => void;
};

export function useCommonMutationApi<TData = unknown>(config: Config<TData>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: unknown) => {
      const url = typeof config.url === 'function' ? config.url(variables) : config.url;
      const result =
        config.method === 'POST'
          ? await PostRequestAxios<TData>(url, variables)
          : config.method === 'PATCH'
            ? await PatchRequestAxios<TData>(url, variables)
            : await DeleteRequestAxios<TData>(url);
      const [data, error] = result;
      if (error || !data) throw new Error(error?.message || 'Request failed');
      return data;
    },
    onSuccess: async (data) => {
      await Promise.all(
        (config.invalidate || []).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
      toast.success(config.successMessage || 'Saved successfully');
      config.onSuccess?.(data);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
