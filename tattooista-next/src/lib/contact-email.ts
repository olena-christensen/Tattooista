import nodemailer from "nodemailer"

import type { ContactCategory, ContactInput } from "@/lib/validations/contact"

// Platform contact form mailer. Intentionally INDEPENDENT from lib/email.ts
// (which is the inherited single-studio transactional stack: verification,
// password reset, booking notices). This uses its own CONTACT_SMTP_* env vars
// so the two never interfere.

let contactTransporter: nodemailer.Transporter | null = null

function getContactTransporter(): nodemailer.Transporter {
  if (!contactTransporter) {
    const host = process.env.CONTACT_SMTP_HOST
    const port = parseInt(process.env.CONTACT_SMTP_PORT || "465", 10)
    const user = process.env.CONTACT_SMTP_USER
    const pass = process.env.CONTACT_SMTP_PASS

    if (!host || !user || !pass) {
      throw new Error(
        "Contact SMTP is not configured. Set CONTACT_SMTP_HOST, CONTACT_SMTP_USER, and CONTACT_SMTP_PASS."
      )
    }

    contactTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })
  }
  return contactTransporter
}

// Category → recipient. Only support@/hello@ are real mailboxes today, so DSAR
// and legal route to the monitored support inbox; the category is preserved in
// the subject tag. Re-point freely as more aliases come online.
const CATEGORY_TO_ALIAS: Record<ContactCategory, string> = {
  general: "hello@nothingweird.agency",
  dsar: "support@nothingweird.agency",
  legal: "support@nothingweird.agency",
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function sendContactEmail(data: ContactInput) {
  const to = CATEGORY_TO_ALIAS[data.category]
  const sender = process.env.CONTACT_SMTP_USER as string

  try {
    await getContactTransporter().sendMail({
      // Zoho only allows sending as an address you own → use the authenticated mailbox.
      from: `Tattooista <${sender}>`,
      to,
      replyTo: data.email,
      subject: `[tattooista:${data.category}] message from ${data.name}`,
      text: `Category: ${data.category}\nName: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <p><strong>Category:</strong> ${escapeHtml(data.category)}</p>
          <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
          <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
        </div>
      `,
    })

    return { success: true as const }
  } catch (err) {
    console.error("Failed to send contact email:", err)
    return { error: "Failed to send your message. Please try again later." }
  }
}
