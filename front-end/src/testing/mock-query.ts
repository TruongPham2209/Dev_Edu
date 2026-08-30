import type {
  InfiniteData,
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import { vi } from "vitest";
import { useApiWithToast } from "@/lib/use-api-with-toast";

export function createMockQueryResult<TData, TError = Error>(
  data?: TData,
  overrides?: Partial<UseQueryResult<TData, TError>>,
): UseQueryResult<TData, TError> {
  const isErr = Boolean(overrides?.isError);
  const isPend = Boolean(overrides?.isPending || overrides?.isLoading);
  const status = isErr ? "error" : isPend ? "pending" : (overrides?.status ?? "success");

  const base = {
    data: data !== undefined ? data : undefined,
    dataUpdatedAt: Date.now(),
    error: isErr ? ((overrides?.error as TError) ?? (new Error("Query error") as unknown as TError)) : null,
    errorUpdateCount: isErr ? 1 : 0,
    errorUpdatedAt: isErr ? Date.now() : 0,
    failureCount: isErr ? 1 : 0,
    failureReason: isErr ? ((overrides?.error as TError) ?? (new Error("Query error") as unknown as TError)) : null,
    fetchStatus: "idle",
    isError: isErr,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isLoading: isPend,
    isLoadingError: isErr,
    isPaused: false,
    isPending: isPend,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: !isErr && !isPend,
    isEnabled: true,
    refetch: vi.fn().mockResolvedValue({
      data,
      error: null,
      isError: false,
      isSuccess: true,
      status: "success",
    }),
    status,
    promise: Promise.resolve(data as TData),
    ...overrides,
  };
  return base as unknown as UseQueryResult<TData, TError>;
}

export function createMockInfiniteQueryResult<
  TData,
  TPageParam = string | null,
  TError = Error,
>(
  data?: InfiniteData<TData, TPageParam>,
  overrides?: Partial<UseInfiniteQueryResult<InfiniteData<TData, TPageParam>, TError>>,
): UseInfiniteQueryResult<InfiniteData<TData, TPageParam>, TError> {
  const isErr = Boolean(overrides?.isError);
  const isPend = Boolean(overrides?.isPending || overrides?.isLoading);
  const status = isErr ? "error" : isPend ? "pending" : (overrides?.status ?? "success");

  const base = {
    data: data !== undefined ? data : undefined,
    dataUpdatedAt: Date.now(),
    error: isErr ? ((overrides?.error as TError) ?? (new Error("Infinite query error") as unknown as TError)) : null,
    errorUpdateCount: isErr ? 1 : 0,
    errorUpdatedAt: isErr ? Date.now() : 0,
    failureCount: isErr ? 1 : 0,
    failureReason: isErr ? ((overrides?.error as TError) ?? (new Error("Infinite query error") as unknown as TError)) : null,
    fetchStatus: "idle",
    isError: isErr,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isFetchingNextPage: false,
    isFetchingPreviousPage: false,
    isInitialLoading: false,
    isLoading: isPend,
    isLoadingError: isErr,
    isPaused: false,
    isPending: isPend,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: !isErr && !isPend,
    hasNextPage: false,
    hasPreviousPage: false,
    fetchNextPage: vi.fn().mockResolvedValue({}),
    fetchPreviousPage: vi.fn().mockResolvedValue({}),
    refetch: vi.fn().mockResolvedValue({
      data,
      error: null,
      isError: false,
      isSuccess: true,
      status: "success",
    }),
    status,
    promise: Promise.resolve(data as InfiniteData<TData, TPageParam>),
    ...overrides,
  };
  return base as unknown as UseInfiniteQueryResult<
    InfiniteData<TData, TPageParam>,
    TError
  >;
}

export function createMockMutationResult<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  overrides?: Partial<UseMutationResult<TData, TError, TVariables, TContext>>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const base = {
    context: undefined,
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    isError: false,
    isIdle: true,
    isPending: false,
    isPaused: false,
    isSuccess: false,
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined as unknown as TData),
    reset: vi.fn(),
    status: "idle",
    submittedAt: 0,
    variables: undefined,
    ...overrides,
  };
  return base as unknown as UseMutationResult<
    TData,
    TError,
    TVariables,
    TContext
  >;
}

import { createMockToast } from "@/testing/mock-data";

export function createMockApiWithToast(
  overrides?: Partial<ReturnType<typeof useApiWithToast>>,
): ReturnType<typeof useApiWithToast> {
  return {
    toast: createMockToast(),
    handleError: vi.fn(),
    handleSuccess: vi.fn(),
    showSuccess: vi.fn(),
    ...overrides,
  };
}
