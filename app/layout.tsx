import React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { BookingProvider } from "@/lib/booking-context"
import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })
const _inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Casa Nova Hotel Campestre",
  description:
    "Experiencia de lujo y confort en el mejor hotel de la ciudad. Reserve su estancia perfecta.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <BookingProvider>
          {children}
          <Toaster />
        </BookingProvider>
      </body>
    </html>
  )
}
