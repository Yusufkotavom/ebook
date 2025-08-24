"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Home, Search, ShoppingCart, User, MessageCircle, Grid3X3, LogIn, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { createClient } from "@/lib/client"
import { openWhatsApp } from "@/lib/whatsapp"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

export function MobileBottomNav() {
  const router = useRouter()
  const pathname = usePathname()
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
    router.push("/")
  }

  const handleWhatsApp = () => {
    openWhatsApp("general")
  }

  // Navigation items for authenticated users
  const authenticatedNavItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      href: "/",
      badge: null,
    },
    {
      id: "products",
      label: "Products",
      icon: Grid3X3,
      href: "/products",
      badge: null,
    },
    {
      id: "cart",
      label: "Cart",
      icon: ShoppingCart,
      href: "/checkout",
      badge: state.itemCount > 0 ? state.itemCount : null,
    },
    {
      id: "whatsapp",
      label: "Support",
      icon: MessageCircle,
      href: null,
      onClick: handleWhatsApp,
      badge: null,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: User,
      href: "/dashboard",
      badge: null,
    },
  ]

  // Navigation items for non-authenticated users
  const guestNavItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      href: "/",
      badge: null,
    },
    {
      id: "products",
      label: "Products",
      icon: Grid3X3,
      href: "/products",
      badge: null,
    },
    {
      id: "cart",
      label: "Cart",
      icon: ShoppingCart,
      href: "/checkout",
      badge: state.itemCount > 0 ? state.itemCount : null,
    },
    {
      id: "whatsapp",
      label: "Support",
      icon: MessageCircle,
      href: null,
      onClick: handleWhatsApp,
      badge: null,
    },
    {
      id: "login",
      label: "Login",
      icon: LogIn,
      href: "/auth/login",
      badge: null,
    },
  ]

  const navItems = user ? authenticatedNavItems : guestNavItems

  const isActive = (href: string | null) => {
    if (!href) return false
    if (href === "/" && pathname === "/") return true
    if (href !== "/" && pathname.startsWith(href)) return true
    return false
  }

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.onClick) {
      item.onClick()
    } else if (item.href) {
      router.push(item.href)
    }
  }

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 relative transition-colors",
                  active 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
                disabled={isLoading}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium truncate">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Dashboard Logout Button - Only show on dashboard pages for authenticated users */}
      {user && pathname.startsWith("/dashboard") && (
        <div className="fixed top-4 right-4 z-50 md:hidden">
          <button
            onClick={handleSignOut}
            className="bg-white shadow-lg border border-gray-200 rounded-full p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  )
}