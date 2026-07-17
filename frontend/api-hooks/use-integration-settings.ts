"use client"

import { useApiMutation } from "./use-api-mutation"
import { useApiQuery } from "./use-api-query"

export type IntegrationSettings = {
  geminiApiKeys: string[]
  geminiTextModel?: string
  geminiVisionModel?: string
  imageEmbeddingProvider?: string
  imageEmbeddingModel?: string
  windyApiKey?: string
  oneSignalAppId?: string
  oneSignalRestApiKey?: string
  active?: boolean
}

type IntegrationSettingsResponse = {
  data: IntegrationSettings
}

export const integrationSettingsKey = ["admin", "integrations"] as const

export function useIntegrationSettings() {
  return useApiQuery<IntegrationSettingsResponse>(
    integrationSettingsKey,
    "/admin/integrations",
  )
}

export function useUpdateIntegrationSettings() {
  return useApiMutation<IntegrationSettingsResponse, IntegrationSettings>({
    method: "PATCH",
    url: "/admin/integrations",
    mutationKey: ["admin", "integrations", "update"],
    invalidateKeys: [integrationSettingsKey],
    successMessage: "Integration settings saved securely",
  })
}
