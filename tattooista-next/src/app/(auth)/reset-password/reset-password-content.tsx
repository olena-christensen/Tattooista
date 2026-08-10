"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  resetPasswordSchema,
  newPasswordSchema,
  type ResetPasswordInput,
  type NewPasswordInput,
} from "@/lib/validations/auth"
import { requestPasswordReset, resetPassword } from "@/lib/actions/auth"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { CheckCircle } from "lucide-react"

function RequestResetForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ResetPasswordInput) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("email", data.email)

      const result = await requestPasswordReset(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      setIsSuccess(true)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          Password reset link sent. Please check your inbox.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </Form>
  )
}

function NewPasswordForm({ token }: { token: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: NewPasswordInput) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("password", data.password)
      formData.append("confirmPassword", data.confirmPassword)

      const result = await resetPassword(token, formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      setIsSuccess(true)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your password has been reset successfully!
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </Form>
  )
}

export function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  return token ? <NewPasswordForm token={token} /> : <RequestResetForm />
}
