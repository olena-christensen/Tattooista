"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { reviewSchema, type ReviewInput } from "@/lib/validations/review"
import { createReview } from "@/lib/actions/reviews"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  studioSlug: string
  onSuccess?: () => void
}

/**
 * Public review submission. Reviewers are the studio's customers, who have no
 * login — they identify themselves with an email the studio already holds on file.
 * Editing is studio-side and has no UI yet, so this form only creates.
 */
export function ReviewForm({ studioSlug, onSuccess }: ReviewFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      email: "",
      rate: 5,
      content: "",
    },
  })

  const currentRating = form.watch("rate")

  async function onSubmit(data: ReviewInput) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("rate", data.rate.toString())
      formData.append("content", data.content)

      const result = await createReview(studioSlug, formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(result.message ?? "Review submitted!")
      onSuccess?.()
      router.refresh()
      form.reset()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Email</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Use the address the studio has on file for you.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform hover:scale-110"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => field.onChange(star)}
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-colors",
                          (hoveredRating || currentRating) >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </form>
    </Form>
  )
}
