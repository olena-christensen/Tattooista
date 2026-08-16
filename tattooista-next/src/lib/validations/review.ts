import { z } from "zod"

export const reviewSchema = z.object({
  // Customers have no login, so this is how a reviewer identifies themselves: the
  // address must already be on file as a contact for one of the studio's clients.
  email: z.string().email("Please enter a valid email address"),
  rate: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  content: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(2000, "Review is too long"),
  gallery: z.array(z.string().url()).optional(),
})

export const updateReviewSchema = reviewSchema.partial()

export type ReviewInput = z.infer<typeof reviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
