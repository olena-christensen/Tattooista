"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cancelProSubscription } from "@/lib/actions/billing"

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: string) => void }
      Initialize: (options: { token: string }) => void
      Checkout: {
        open: (options: Record<string, unknown>) => void
      }
    }
  }
}

const PADDLE_JS_URL = "https://cdn.paddle.com/paddle/v2/paddle.js"

let paddleLoading: Promise<void> | null = null

function loadPaddle(): Promise<void> {
  if (window.Paddle) return Promise.resolve()
  if (paddleLoading) return paddleLoading

  paddleLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = PADDLE_JS_URL
    script.async = true
    script.onload = () => {
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
      if (!window.Paddle || !token) {
        reject(new Error("Paddle failed to initialize"))
        return
      }
      if (process.env.NEXT_PUBLIC_PADDLE_ENV !== "live") {
        window.Paddle.Environment.set("sandbox")
      }
      window.Paddle.Initialize({ token })
      resolve()
    }
    script.onerror = () => reject(new Error("Failed to load the Paddle script"))
    document.head.appendChild(script)
  })

  return paddleLoading
}

interface BillingCardProps {
  plan: "FREE" | "PRO"
  studioId: string
  slug: string
  hasSubscription: boolean
}

export function BillingCard({ plan, studioId, slug, hasSubscription }: BillingCardProps) {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function openCheckout(priceId: string | undefined) {
    if (!priceId) {
      setError("Checkout is not configured — missing price identifier.")
      return
    }
    setError(null)
    setBusy(true)
    try {
      await loadPaddle()
      window.Paddle!.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { studioId },
        settings: {
          successUrl: `${window.location.origin}/${slug}/admin/settings?upgraded=1`,
        },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed to open")
    } finally {
      setBusy(false)
    }
  }

  // "Go Pro" on the landing page is a buying decision already made — it links here with
  // ?checkout=monthly|yearly and the payment overlay opens straight away, rather than
  // asking the person to find and press the same button a second time.
  const autoCheckoutStarted = useRef(false)
  useEffect(() => {
    if (autoCheckoutStarted.current || plan !== "FREE") return

    const wanted = new URLSearchParams(window.location.search).get("checkout")
    const priceId =
      wanted === "monthly"
        ? process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_MONTHLY
        : wanted === "yearly"
          ? process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_YEARLY
          : undefined
    if (!priceId) return

    autoCheckoutStarted.current = true
    // Drop the parameter so a refresh or a back-navigation does not reopen the overlay.
    window.history.replaceState({}, "", window.location.pathname)
    openCheckout(priceId)
    // Runs once on arrival; openCheckout is stable enough for that and re-running it
    // would mean reopening a payment overlay the person may have just dismissed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan])

  async function handleCancel() {
    setBusy(true)
    setError(null)
    const result = await cancelProSubscription()
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setMessage(result.message ?? "Subscription canceled.")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan &amp; Billing</CardTitle>
        <CardDescription>
          {plan === "PRO"
            ? "You are on the PRO plan: unlimited clients, unlimited photo storage, up to 5 team accounts."
            : "You are on the Free plan: 1 account, up to 50 clients, 500 MB of photos."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {plan === "FREE" && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              disabled={busy}
              onClick={() => openCheckout(process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_MONTHLY)}
            >
              Go Pro — €14 / month
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => openCheckout(process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_YEARLY)}
            >
              Go Pro — €140 / year (two months free)
            </Button>
          </div>
        )}

        {plan === "PRO" && hasSubscription && !message && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Cancel anytime — PRO stays active until the end of the paid period.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={busy}>
                  Cancel subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel PRO subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your studio keeps PRO until the end of the current paid period,
                    then moves to the Free plan. No data is deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep PRO</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>
                    Cancel subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {message && <p className="text-sm">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
