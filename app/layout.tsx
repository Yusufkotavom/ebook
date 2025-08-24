import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { CartProvider } from "@/hooks/use-cart"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CurrencyProvider } from "@/contexts/currency-context"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export const metadata: Metadata = {
  title: "Ebook Store",
  description: "Your digital library awaits",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <CurrencyProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pb-20 md:pb-0">{children}</main>
              <Footer />
              <MobileBottomNav />
            </div>
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  )
}
