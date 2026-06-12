"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { createStudioSchema, type CreateStudioInput } from "@/lib/validations/auth"
import { createStudio } from "@/lib/actions/auth"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"
import { generateSlug } from "@/lib/slug"
import { DPA_PDF_PATH } from "@/lib/constants"

export function CreateStudioForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ slug: string } | null>(null)

  const form = useForm<CreateStudioInput>({
    resolver: zodResolver(createStudioSchema),
    defaultValues: { studioName: "", email: "", password: "", confirmPassword: "", dpaAccepted: false },
  })

  const studioName = form.watch("studioName")
  const previewSlug = studioName ? generateSlug(studioName) : ""

  async function onSubmit(data: CreateStudioInput) {
    setIsSubmitting(true)
    setServerError(null)
    try {
      const formData = new FormData()
      formData.append("studioName", data.studioName)
      formData.append("email", data.email)
      formData.append("password", data.password)
      formData.append("confirmPassword", data.confirmPassword)
      formData.append("dpaAccepted", data.dpaAccepted ? "true" : "false")
      const result = await createStudio(formData)
      if (result.error) {
        setServerError(result.error)
        return
      }
      setSuccessData({ slug: result.slug! })
    } catch {
      setServerError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successData) {
    return (
      <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Studio created!</strong>
          <p className="mt-2">
            Your studio URL will be: <strong>{successData.slug}.tattooista.com</strong>
          </p>
          <p className="mt-2">
            We&apos;ve sent a verification email to your address. Please check your inbox
            and click the link to activate your account, then you can log in and start
            setting up your studio.
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="text" inputMode="email" autoComplete="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
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
