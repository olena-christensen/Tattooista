import { NextRequest, NextResponse } from "next/server"

import { contactSchema } from "@/lib/validations/contact"
import { sendContactEmail } from "@/lib/contact-email"

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 }
    )
  }

  // Honeypot: a real user never fills this. Pretend success, send nothing.
  if (parsed.data.company && parsed.data.company.trim() !== "") {
    return NextResponse.json({ success: true })
  }

  const result = await sendContactEmail(parsed.data)
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  return NextResponse.json({ success: true })
}
