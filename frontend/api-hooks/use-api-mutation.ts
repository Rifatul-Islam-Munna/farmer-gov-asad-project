"use client"

import {
  MutationKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { apiDelete, apiPatch, apiPost } from "./api-client"

type Method = "POST" | "PATCH" | "DELETE"

type MutationConfig<TData, TVariables> = {
  method: Method
  url: string | ((variables: TVariables) => string)
  mutationKey?: MutationKey
  invalidateKeys?: MutationKey[]
  successMessage?: string
  body?: (variables: TVariables) => unknown
  onSuccess?: (data: TData) => void
}

export function useApiMutation<TData = unknown, TVariables = void>(
  config: MutationConfig<TData, TVariables>,
) {
  const queryClient = useQueryClient()

  return useMutation<TData, Error, TVariables>({
    mutationKey: config.mutationKey,
    mutationFn: async (variables) => {
      const url = typeof config.url === "function" ? config.url(variables) : config.url
      const body = config.body ? config.body(variables) : variables

      if (config.method === "POST") return apiPost<TData, unknown>(url, body)
      if (config.method === "PATCH") return apiPatch<TData, unknown>(url, body)
      return apiDelete<TData>(url)
    },
    onSuccess: async (data) => {
      await Promise.all(
        (config.invalidateKeys ?? []).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      )
      if (config.successMessage) toast.success(config.successMessage)
      config.onSuccess?.(data)
    },
    onError: (error) => toast.error(error.message),
  })
}
