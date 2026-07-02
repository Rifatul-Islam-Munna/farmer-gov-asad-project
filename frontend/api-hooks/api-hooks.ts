import axios from 'axios';

export type ApiFailure = {
  message: string;
  statusCode: number;
};

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

function failure(error: unknown): ApiFailure {
  if (!axios.isAxiosError(error)) {
    return { message: 'Unknown request error', statusCode: 500 };
  }
  const body = error.response?.data as {
    message?: string | string[];
    statusCode?: number;
  } | undefined;
  const message = Array.isArray(body?.message)
    ? body?.message[0]
    : body?.message;
  return {
    message: message || 'Something went wrong',
    statusCode: body?.statusCode || error.response?.status || 500,
  };
}

async function tuple<T>(promise: Promise<{ data: T }>) {
  try {
    const response = await promise;
    return [response.data, null] as const;
  } catch (error) {
    return [null, failure(error)] as const;
  }
}

export function PostRequestAxios<T>(url: string, payload: unknown) {
  return tuple<T>(client.post<T>(url, payload));
}

export function PatchRequestAxios<T>(url: string, payload: unknown) {
  return tuple<T>(client.patch<T>(url, payload));
}

export function DeleteRequestAxios<T>(url: string) {
  return tuple<T>(client.delete<T>(url));
}

export async function GetRequestNormal<T>(url: string): Promise<T> {
  try {
    const response = await client.get<T>(url);
    return response.data;
  } catch (error) {
    throw new Error(failure(error).message);
  }
}
