import axios, { AxiosError, AxiosInstance } from "axios"

export type ApiErrorPayload = {
  statusCode?: number
  message?: string | string[]
  error?: string
  details?: unknown
  requestId?: string
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly details?: unknown,
    readonly requestId?: string,
  ) {
    super(message)
    this.name = "ApiClientError"
  }
}

function csrfToken() {
  if (typeof document === "undefined") return undefined
  const raw = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("agrivision_csrf="))
    ?.split("=")[1]
  return raw ? decodeURIComponent(raw) : undefined
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: "/api/backend",
  timeout: 30_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase() ?? "GET"
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const token = csrfToken()
    if (token) config.headers["x-csrf-token"] = token
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const payload = error.response?.data
    const rawMessage = payload?.message
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : rawMessage ?? error.message ?? "Request failed"

    throw new ApiClientError(
      message,
      error.response?.status ?? payload?.statusCode ?? 500,
      payload?.details,
      payload?.requestId,
    )
  },
)

export async function apiGet<T>(url: string, signal?: AbortSignal): Promise<T> {
  const { data } = await apiClient.get<T>(url, { signal })
  return data
}

export async function apiPost<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
): Promise<TResponse> {
  const { data } = await apiClient.post<TResponse>(url, body)
  return data
}

export async function apiPatch<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
): Promise<TResponse> {
  const { data } = await apiClient.patch<TResponse>(url, body)
  return data
}

export async function apiDelete<TResponse>(url: string): Promise<TResponse> {
  const { data } = await apiClient.delete<TResponse>(url)
  return data
}
