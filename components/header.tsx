"use client"

import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, User, LogOut, Search } from "lucide-react"
import Link from "next/link"

export function Header() {
  const { state } = useCart()
  const { user, isLoading, signOut } = useAuth()

  return (
    <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">ES</span>
            </div>
            <span className="hidden sm:block">Ebook Store</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link href="/books">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                Books
              </Button>
            </Link>
            <Link href="/subscriptions">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                Subscriptions
              </Button>
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search - Desktop only, mobile has it in bottom nav */}
            <Link href="/books" className="hidden md:block">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Search className="h-4 w-4" />
              </Button>
            </Link>

            {/* Cart - Always visible */}
            <Link href="/checkout" className="relative">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ShoppingCart className="h-4 w-4" />
                {state.itemCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    {state.itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu - Desktop only, mobile has it in bottom nav */}
            {!isLoading && (
              <div className="hidden md:flex items-center space-x-1">
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        <User className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:block">Dashboard</span>
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={signOut} className="text-gray-600 hover:text-red-600">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile User Indicator - Just show if logged in */}
            {!isLoading && user && (
              <div className="md:hidden">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 p-2">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
