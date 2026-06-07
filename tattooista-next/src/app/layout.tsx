import type { Metadata } from "next"
import { headers } from "next/headers"
import { Cormorant_Garamond, DM_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/shared/providers"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Tattooista — The Platform for Modern Tattoo Studios",
    template: "%s | Tattooista",
  },
  description:
    "The all-in-one platform for tattoo studios. Launch your branded site, showcase your portfolio, and let clients book you.",
  keywords: ["tattoo", "tattoo studio", "custom tattoo", "tattoo artist", "tattoo booking", "tattoo platform"],
  authors: [{ name: "Tattooista" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Tattooista",
    title: "Tattooista — The Platform for Modern Tattoo Studios",
    description:
      "The all-in-one platform for tattoo studios. Launch your branded site, showcase your portfolio, and let clients book you.",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Global Privacy Control: detect the Sec-GPC request header server-side so the
  // consent state resolves correctly on first paint (the client confirms via
  // navigator.globalPrivacyControl after hydration).
  const gpcServer = (await headers()).get("sec-gpc") === "1"

  return (
    <html lang="en" className={`dark ${cormorant.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers gpcServer={gpcServer}>{children}</Providers>
      </body>
    </html>
  )
}
