"use client"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import {
  contactSchema,
  type ContactInput,
  CONTACT_CATEGORIES,
} from "@/lib/validations/contact"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      category: "general",
      message: "",
      company: "",
    },
  })

  async function onSubmit(data: ContactInput) {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json().catch(() => ({}))

      if (!res.ok || json?.error) {
        toast.error(json?.error || "Something went wrong. Please try again.")
        return
      }

      toast.success("Thanks — your message has been sent. We'll be in touch.")
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
        {/* Honeypot — hidden from users, off-screen. Bots fill it; we drop those. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            width: 1,
            height: 1,
            overflow: "hidden",
          }}
        >
          <label htmlFor="company">Company</label>
          <input
            id="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("company")}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What is this about? *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTACT_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="How can we help?"
                  className="min-h-[140px]"
                  {...field}
                />
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
            "Send message"
          )}
        </Button>
      </form>
    </Form>
  )
}
