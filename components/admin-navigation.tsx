"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  Bell, 
  Menu, 
  X,
  LogOut,
  CreditCard,
  Home
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics"
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    description: "Manage your ebook catalog"
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    description: "View and manage orders"
  },
  {
    name: "Payment Methods",
    href: "/admin/settings/payment-methods",
    icon: CreditCard,
    description: "Configure payment options"
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    description: "Send customer notifications"
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Store configuration"
  },
]

export function AdminNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    try {
      const { createClient } = await import("@/lib/client")
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/admin/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const NavContent = () => (
    <nav className="flex flex-1 flex-col">
      <div className="space-y-1 px-2 pb-4">
        {navigation.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                active
                  ? "bg-blue-100 text-blue-900 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {item.description}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Bottom section */}
      <div className="mt-auto px-2 pb-4 space-y-2">
        <div className="border-t border-gray-200 pt-4">
          <Link
            href="/"
            className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
          >
            <Home className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600" />
            View Store
          </Link>
          
          <button
            onClick={handleSignOut}
            className="w-full group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm border-b">
          <div className="flex items-center space-x-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">ES</span>
                      </div>
                      <span className="font-semibold text-gray-900">Admin Panel</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                      <NavContent />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ES</span>
              </div>
              <span className="font-semibold text-gray-900">Admin</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="p-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-lg">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">ES</span>
              </div>
              <div>
                <h1 className="text-white font-semibold">Ebook Store</h1>
                <p className="text-blue-100 text-xs">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto py-4">
            <NavContent />
          </div>
        </div>
      </div>
    </>
  )
}