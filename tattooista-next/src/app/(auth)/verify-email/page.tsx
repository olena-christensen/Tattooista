import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VerifyEmailContent } from "./verify-email-content"

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address.",
}

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Invalid Link</CardTitle>
          <CardDescription className="text-center">
            This verification link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild>
            <Link href="/">Go to Tattooista</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Verifying signs the user in, so it has to run in a server action from the client —
  // a server component cannot set the session cookie during render.
  return <VerifyEmailContent token={token} />
}
