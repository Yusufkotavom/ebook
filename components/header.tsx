"use client"

import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, User, LogOut, MessageCircle, Search, Menu } from "lucide-react"
import Link from "next/link"
import { WhatsAppButton } from "@/components/whatsapp-support"

export function Header() {
  const { state } = useCart()
  const { user, isLoading, signOut } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="text-xl font-bold text-gray-900">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ES</span>
              </div>
              <span className="hidden sm:block">Ebook Store</span>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile since we have bottom nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/products">
              <Button variant="ghost" size="sm">
                Products
              </Button>
            </Link>

            {/* WhatsApp Support - Desktop only */}
            <WhatsAppButton
              type="general"
              variant="outline"
              size="sm"
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Support
            </WhatsAppButton>
          </div>

          {/* Right Side - Desktop Only */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart - Desktop */}
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

            {/* User Menu - Desktop */}
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
                                                 <Button variant="ghost" size="sm" onClick={signOut}>
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

          {/* Mobile Right Side - Only Search and Cart Count */}
          <div className="flex md:hidden items-center space-x-3">
            {/* Search Button - Mobile */}
            <Link href="/products">
              <Button variant="ghost" size="sm" className="p-2">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            {/* Cart Badge - Mobile (no button, just indicator) */}
            {state.itemCount > 0 && (
              <div className="relative">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{state.itemCount}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
