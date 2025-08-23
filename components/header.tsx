"use client"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { BookOpen, User, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useCart } from "@/hooks/use-cart"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const { state } = useCart()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">ES</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
              Products
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {state.itemCount > 0 && (
              <Link href="/checkout">
                <Button variant="outline" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart ({state.itemCount})
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
