"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { Toaster } from "@/components/ui/sonner"
import { CookieConsent, GpcProvider } from "@/components/shared/cookie-consent"

export function Providers({
  children,
  gpcServer = false,
}: {
  children: React.ReactNode
  // Sec-GPC header value, read server-side in the root layout. Seeds the GPC
  // context so the client store resolves correctly on first paint.
  gpcServer?: boolean
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <GpcProvider value={gpcServer}>
          {children}
          <Toaster position="top-center" richColors />
          <CookieConsent />
        </GpcProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
