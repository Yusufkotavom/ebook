"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, Clock, Crown, Zap } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { useCart } from "@/hooks/use-cart"
import toast from "react-hot-toast"
import type { User } from "@supabase/supabase-js"

interface SubscriptionPackage {
  id: string
  name: string
  description: string
  duration_days: number | null
  price: string
  currency: string
  features: string[]
  is_active: boolean
  is_featured: boolean
  sort_order: number
}

interface SubscriptionPackagesProps {
  packages: SubscriptionPackage[]
  currentUser: User | null
  hasActiveSubscription: boolean
}

export function SubscriptionPackages({ packages, currentUser, hasActiveSubscription }: SubscriptionPackagesProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const { formatPrice } = useCurrency()
  const { addToCart } = useCart()

  const handleSubscribe = async (pkg: SubscriptionPackage) => {
    if (!currentUser) {
      toast.error("Please log in to subscribe")
      return
    }

    if (hasActiveSubscription) {
      toast.error("You already have an active subscription")
      return
    }

    setLoading(pkg.id)
    setSelectedPackage(pkg.id)

    try {
      // Add subscription package to cart as a special product
      addToCart({
        id: `subscription-${pkg.id}`,
        title: `${pkg.name} Subscription`,
        author: "Ebook Store",
        price: parseFloat(pkg.price),
        image_url: "/subscription-icon.png", // You can add a subscription icon
        isSubscription: true,
        subscriptionPackageId: pkg.id,
        duration_days: pkg.duration_days
      })

      toast.success(`🎉 "${pkg.name}" added to cart! Complete checkout to activate.`, {
        duration: 4000
      })

      // Optional: Redirect to checkout
      // router.push('/checkout')
      
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error("Failed to add subscription to cart")
    } finally {
      setLoading(null)
      setSelectedPackage(null)
    }
  }

  const getPackageIcon = (pkg: SubscriptionPackage) => {
    if (pkg.duration_days === null) {
      return <Crown className="h-6 w-6 text-yellow-500" />
    } else if (pkg.duration_days === 30) {
      return <Star className="h-6 w-6 text-blue-500" />
    } else {
      return <Zap className="h-6 w-6 text-green-500" />
    }
  }

  const getPackageColor = (pkg: SubscriptionPackage) => {
    if (pkg.duration_days === null) {
      return "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50"
    } else if (pkg.duration_days === 30) {
      return "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
    } else {
      return "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
    }
  }

  const formatDuration = (days: number | null) => {
    if (days === null) return "Lifetime"
    if (days === 1) return "1 Day"
    if (days === 30) return "30 Days"
    return `${days} Days`
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No subscription packages available at this time.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <Card 
          key={pkg.id} 
          className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${getPackageColor(pkg)} ${
            pkg.is_featured ? 'ring-2 ring-blue-500 scale-105' : ''
          }`}
        >
          {/* Featured Badge */}
          {pkg.is_featured && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-500 text-white">
                ⭐ Popular
              </Badge>
            </div>
          )}

          {/* Lifetime Special Badge */}
          {pkg.duration_days === null && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-1 text-sm font-medium">
              🔥 Best Value - Lifetime Access
            </div>
          )}

          <CardHeader className={pkg.duration_days === null ? "pt-8" : ""}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getPackageIcon(pkg)}
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(parseFloat(pkg.price))}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDuration(pkg.duration_days)}
                </div>
              </div>
            </div>
            <CardDescription className="text-sm">
              {pkg.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Features List */}
            <div className="space-y-2">
              {pkg.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Duration Info */}
            <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {pkg.duration_days === null 
                  ? "Unlimited access forever" 
                  : `Access for ${formatDuration(pkg.duration_days)}`
                }
              </span>
            </div>

            {/* Subscribe Button */}
            <Button
              onClick={() => handleSubscribe(pkg)}
              disabled={loading === pkg.id || !currentUser || hasActiveSubscription}
              className={`w-full ${
                pkg.duration_days === null 
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" 
                  : pkg.duration_days === 30 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading === pkg.id ? (
                <>
                  <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full mr-2" />
                  Processing...
                </>
              ) : hasActiveSubscription ? (
                "Already Subscribed"
              ) : !currentUser ? (
                "Login to Subscribe"
              ) : (
                <>
                  Subscribe Now
                  {pkg.duration_days === null && <Crown className="h-4 w-4 ml-2" />}
                </>
              )}
            </Button>

            {/* Value Proposition */}
            {pkg.duration_days === 30 && (
              <p className="text-xs text-center text-gray-500">
                Perfect for regular readers
              </p>
            )}
            
            {pkg.duration_days === 1 && (
              <p className="text-xs text-center text-gray-500">
                Great for trying our service
              </p>
            )}
            
            {pkg.duration_days === null && (
              <p className="text-xs text-center text-yellow-700 font-medium">
                Save money with one-time payment!
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}