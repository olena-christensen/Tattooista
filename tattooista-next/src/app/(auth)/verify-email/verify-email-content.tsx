"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { verifyEmailAndSignIn } from "@/lib/actions/auth"
import { XCircle } from "lucide-react"

/**
 * Runs the verification as soon as the link is opened, then goes straight to the
 * studio. Nothing to click, and no login form — signup collected the credentials
 * once and that is the end of it.
 *
 * A client component because the sign-in has to happen in a server *action* (it sets
 * the session cookie); a server component cannot set cookies while rendering.
 */
export function VerifyEmailContent({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null)
  // React runs effects twice in dev StrictMode, and the token is single-use — the
  // second run would always fail. Guard so it is spent exactly once.
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    verifyEmailAndSignIn(token)
      .then((result) => {
        if (result.error) {
          setError(result.error)
          return
        }
        window.location.href = `/${result.slug}/admin`
      })
      .catch(() => setError("Something went wrong. Please try again."))
  }, [token])

  if (error) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Verification Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center">
            <Button asChild>
              <Link href="/">Go to Tattooista</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Verifying your email</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-6">
        <LoadingSpinner />
        <p className="text-sm text-muted-foreground text-center">
          One moment — taking you to your studio.
        </p>
      </CardContent>
    </Card>
  )
}
