export const dynamic = "force-dynamic"

import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getStudioSettings } from "@/lib/actions/studio"
import { StudioSettingsForm } from "./studio-settings-form"
import { DeleteStudioButton } from "./delete-studio-button"
import { BillingCard } from "./billing-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Settings",
}

export default async function SettingsPage() {
  const studio = await getStudioSettings()

  if (!studio) {
    redirect("/")
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your studio settings.
        </p>
      </div>

      <StudioSettingsForm studio={studio} />

      <BillingCard
        plan={studio.plan}
        studioId={studio.id}
        slug={studio.slug}
        hasSubscription={Boolean(studio.paddleSubscriptionId)}
      />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Studio</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this studio and all its data.
              </p>
            </div>
            <DeleteStudioButton />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
