"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { useLiveRace } from "@/hooks/useLiveRace";

function LiveRaceInitializer() {
  useLiveRace(); // Start the SSE telemetry connection
  return null;
}

const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 3,
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
};

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));

  return (
    <QueryClientProvider client={queryClient}>
      <LiveRaceInitializer />
      {children}
    </QueryClientProvider>
  );
}
