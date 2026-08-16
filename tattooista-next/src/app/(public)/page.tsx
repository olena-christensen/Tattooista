import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PlatformLanding } from "@/components/platform-landing"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>
}) {
  const session = await auth()

  if (session?.user?.studioSlug) {
    redirect(`/${session.user.studioSlug}`)
  }

  // ?create=studio is where the login form sends a user who signed in successfully but
  // owns no studio — the reload is what lets this page see their session at all.
  const { create } = await searchParams

  // Anyone with a studio was redirected above, so a session here means a signed-in
  // account that owns nothing — it gets the studio form without credential fields.
  return (
    <PlatformLanding
      signedInEmail={session?.user?.email ?? null}
      openCreateStudio={create === "studio"}
    />
  )
}
