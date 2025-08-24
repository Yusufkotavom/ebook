"use client"

import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, User, LogOut, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { WhatsAppButton } from "@/components/whatsapp-support"

export function Header() {
  const { state } = useCart()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="text-xl font-bold text-gray-900">
            Ebook Store
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {/* WhatsApp Support */}
            <WhatsAppButton
              type="general"
              variant="outline"
              size="sm"
              className="hidden sm:flex border-green-200 text-green-700 hover:bg-green-50"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Support
            </WhatsAppButton>

            {/* Mobile WhatsApp */}
            <WhatsAppButton
              type="general"
              variant="outline"
              size="sm"
              className="sm:hidden border-green-200 text-green-700 hover:bg-green-50"
              icon={false}
            >
              <MessageCircle className="h-4 w-4" />
            </WhatsAppButton>

            {/* Products Link */}
            <Link href="/products">
              <Button variant="ghost" size="sm">
                Products
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/checkout" className="relative">
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4" />
                {state.itemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {state.itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up">
                      <Button size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
