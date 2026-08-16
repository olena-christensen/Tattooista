"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  createStudioForExistingUserSchema,
  type CreateStudioForExistingUserInput,
} from "@/lib/validations/auth"
import { createStudioForExistingUser } from "@/lib/actions/auth"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { generateSlug } from "@/lib/slug"
import { DPA_PDF_PATH } from "@/lib/constants"

/**
 * Studio creation for a user who is already signed in but owns no studio.
 *
 * Deliberately collects no email or password — the server takes identity from the
 * session and ignores anything else. See createStudioForExistingUser().
 */
export function CreateStudioSignedInForm({ email }: { email: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const { update } = useSession()

  const form = useForm<CreateStudioForExistingUserInput>({
    resolver: zodResolver(createStudioForExistingUserSchema),
    defaultValues: { studioName: "", dpaAccepted: false },
  })

  const studioName = form.watch("studioName")
  const previewSlug = studioName ? generateSlug(studioName) : ""

  async function onSubmit(data: CreateStudioForExistingUserInput) {
    setIsSubmitting(true)
    setServerError(null)
    try {
      const formData = new FormData()
      formData.append("studioName", data.studioName)
      formData.append("dpaAccepted", data.dpaAccepted ? "true" : "false")
      const result = await createStudioForExistingUser(formData)
      if (result.error) {
        setServerError(result.error)
        return
      }
      // Push the new slug into the JWT before navigating. getSessionStudio() reads
      // session.user.studioSlug, and the token still says null at this point — without
      // this the user lands in an admin area that rejects every action.
      await update({ studioSlug: result.slug })
      window.location.href = `/${result.slug}/admin`
    } catch {
      setServerError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <p className="text-center text-sm text-muted-foreground">
          Creating a studio for <span className="text-foreground">{email}</span>
        </p>
        <FormField
          control={form.control}
          name="studioName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Studio Name</FormLabel>
              <FormControl>
                <Input placeholder="My Tattoo Studio" {...field} />
              </FormControl>
              {previewSlug && previewSlug.length >= 3 && (
                <p className="text-xs text-muted-foreground">
                  Your URL: {previewSlug}.tattooista.com
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dpaAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">
                  I have read and agree to the{" "}
                  <a
                    href={DPA_PDF_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    Data Processing Agreement
                  </a>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        {serverError && (
          <p className="text-destructive text-sm text-center">{serverError}</p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <><LoadingSpinner size="sm" className="mr-2" />Creating studio...</>
          ) : "Create Studio"}
        </Button>
      </form>
    </Form>
  )
}
