"use client"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, ShoppingBag, CreditCard, Download, LogOut, Menu, User } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { name: "Downloads", href: "/dashboard/downloads", icon: Download },
  { name: "Payment Methods", href: "/dashboard/payments", icon: CreditCard },
  { name: "Profile", href: "/dashboard/profile", icon: User },
]

interface UserSidebarProps {
  user: SupabaseUser
}

function SidebarContent({ user, onNavigate }: UserSidebarProps & { onNavigate?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">My Account</h2>
        <p className="text-sm text-gray-600 mt-1 truncate">{user.email}</p>
      </div>

      <nav className="flex-1 mt-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-gray-200 mt-auto">
        <Link href="/" className="block mb-4">
          <Button variant="outline" className="w-full bg-transparent">
            Back to Store
          </Button>
        </Link>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full flex items-center justify-center bg-transparent"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export function UserSidebar({ user }: UserSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:h-full lg:w-64 lg:shadow-lg">
        <SidebarContent user={user} />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">My Account</h2>
              <p className="text-xs text-gray-600 truncate max-w-32">{user.email}</p>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <div className="h-full">
                <SidebarContent user={user} onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
