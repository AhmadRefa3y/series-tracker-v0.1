"use client"; // Important for Next.js

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/*
       * `reducedMotion="user"` lets framer-motion honour the OS "reduce motion"
       * setting at animation time. Unlike calling `useReducedMotion()` and
       * branching props on it (which returns false during SSR but true on the
       * client and therefore breaks hydration), this never changes the markup.
       */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </QueryClientProvider>
  );
}
