import axios, { type AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: unknown;
}

export const isAxiosError = <T = unknown, D = unknown>(error: unknown): error is AxiosError<T, D> =>
  axios.isAxiosError<T, D>(error);

export const getApiErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError<ApiErrorResponse>(err)) {
    const message = err.response?.data?.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
};
