"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { login, getMyStudioSlug } from "@/lib/actions/auth"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import Link from "next/link"

export function OwnerLoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginInput) {
    setIsSubmitting(true)
    setServerError(null)
    try {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)
      const result = await login(formData)
      if (result.error) {
        setServerError(result.error)
        return
      }

      // Signed in — send them to their studio's admin. An account with no studio has
      // nowhere to land: navigating to "/" reloads the page they are already on, which
      // reads as the login having silently failed (and wipes the console/network log
      // that would explain it). Say what happened instead.
      const slug = await getMyStudioSlug()
      if (!slug) {
        setServerError(
          "You're signed in, but this account doesn't have a studio yet. Use \"Create one\" below to set one up."
        )
        return
      }
      window.location.href = `/${slug}/admin`
    } catch {
      setServerError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link href="/reset-password" className="text-sm text-muted-foreground hover:text-primary">
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {serverError && (
          <p className="text-destructive text-sm text-center">{serverError}</p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <><LoadingSpinner size="sm" className="mr-2" />Signing in...</>
          ) : "Sign in"}
        </Button>
      </form>
    </Form>
  )
}
