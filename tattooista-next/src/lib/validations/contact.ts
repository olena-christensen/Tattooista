import { z } from "zod"

// Shown in the category <Select> on the contact form (client-safe).
export const CONTACT_CATEGORIES = [
  { value: "general", label: "General / Support" },
  { value: "billing", label: "Billing / Refund" },
  { value: "dsar", label: "Data / Privacy (DSAR)" },
  { value: "legal", label: "Legal / IP" },
] as const

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Please enter your name")
    .max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email"),
  category: z.enum(["general", "billing", "dsar", "legal"]),
  message: z
    .string()
    .min(10, "Please write at least a few words")
    .max(2000, "Message is too long"),
  // Honeypot — must stay empty. Bots tend to fill every field.
  company: z.string().optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
export type ContactCategory = ContactInput["category"]
