import { QueryClient, QueryFunction, useQuery } from "@tanstack/react-query";
import React from "react";

export function useApiQuery<T>(options: Parameters<typeof useQuery<T>>[0] & {
  queryParams?: Record<string, string>
}) {
  const { queryKey, queryParams, ...rest } = options;
  
  // Create URL with query parameters if provided
  const enhancedQueryKey = React.useMemo(() => {
    if (!queryParams || Object.keys(queryParams).length === 0) {
      return queryKey;
    }
    
    const baseUrl = queryKey[0] as string;
    const url = new URL(baseUrl, window.location.origin);
    
    // Add query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
    
    // Replace first element of queryKey with the enhanced URL
    return [url.pathname + url.search, ...(queryKey as any).slice(1)];
  }, [queryKey, queryParams]);
  
  return useQuery<T>({
    ...rest,
    queryKey: enhancedQueryKey,
  });
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
