import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { CartProvider } from "@/hooks/use-cart"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CurrencyProvider } from "@/contexts/currency-context"
import { AuthProvider } from "@/contexts/auth-context"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Toaster } from "react-hot-toast"
import { NavigationProgress } from "@/components/navigation-progress"
import { GlobalLoading } from "@/components/global-loading"
import { LoadingProvider } from "@/hooks/use-loading"
import { CompilationDetector } from "@/components/compilation-detector"
import { Suspense } from "react"
import { ConditionalLayout } from "@/components/conditional-layout"

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
        <LoadingProvider>
          <AuthProvider>
            <CurrencyProvider>
              <CartProvider>
                <Suspense>
                  <NavigationProgress />
                </Suspense>
                <Suspense>
                  <GlobalLoading />
                </Suspense>
                <CompilationDetector />
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#ffffff',
                      color: '#000000',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#22c55e',
                        secondary: '#ffffff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                      },
                    },
                  }}
                />
              </CartProvider>
            </CurrencyProvider>
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  )
}
