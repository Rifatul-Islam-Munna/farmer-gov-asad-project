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

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.BASE_URL ??
  "http://localhost:4000"

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      window.localStorage.getItem("access_token") ??
      window.localStorage.getItem("farmer-admin-token")
    if (token) config.headers.Authorization = `Bearer ${token}`
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
