// Server-side Paddle API helper.
// Environment is chosen by PADDLE_ENV ("sandbox" | "live"); the API key must match it.

const PADDLE_API_BASE =
  process.env.PADDLE_ENV === "live"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com"

async function paddleFetch(path: string, init?: RequestInit) {
  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey) {
    throw new Error("PADDLE_API_KEY is not set")
  }

  const res = await fetch(`${PADDLE_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Paddle API ${res.status} on ${path}: ${body}`)
  }

  return res.json()
}

/**
 * Cancel a subscription at the end of the current billing period.
 * The plan in our database changes only when Paddle's webhook confirms it.
 */
export async function cancelPaddleSubscription(subscriptionId: string) {
  return paddleFetch(`/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ effective_from: "next_billing_period" }),
  })
}

export async function getPaddleSubscription(subscriptionId: string) {
  return paddleFetch(`/subscriptions/${subscriptionId}`)
}
