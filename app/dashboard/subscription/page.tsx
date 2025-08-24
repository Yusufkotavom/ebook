"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Calendar, Clock, ExternalLink, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { SectionLoading } from "@/components/page-loading"

interface SubscriptionData {
  id: string
  subscription_package_id: string
  start_date: string
  end_date: string
  is_active: boolean
  package_name: string
  duration_days: number | null
  package_price: number
  order_id: string
}

interface AccessiblePage {
  name: string
  href: string
  description: string
  icon: React.ReactNode
}

const accessiblePages: AccessiblePage[] = [
  {
    name: "Book Downloads",
    href: "/books",
    description: "Download any book from our entire collection",
    icon: <ExternalLink className="h-4 w-4" />
  }
]

export default function SubscriptionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUserAndSubscription()
  }, [])

  const checkUserAndSubscription = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Check if user has active subscription
      const { data: hasActiveSub } = await supabase.rpc('has_active_subscription', {
        user_uuid: user.id
      })

      setHasActiveSubscription(hasActiveSub || false)

      if (hasActiveSub) {
        // Get subscription details
        const { data: subData } = await supabase.rpc('get_active_subscription', {
          user_uuid: user.id
        })

        if (subData && subData.length > 0) {
          setSubscription(subData[0])
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (!subscription) return null

    if (!subscription.is_active) {
      return <Badge variant="destructive">Expired</Badge>
    }

    if (subscription.duration_days === null) {
      return <Badge variant="default" className="bg-purple-600">Lifetime</Badge>
    }

    const endDate = new Date(subscription.end_date)
    const now = new Date()
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft <= 0) {
      return <Badge variant="destructive">Expired</Badge>
    }

    if (daysLeft <= 1) {
      return <Badge variant="destructive">Expires Today</Badge>
    }

    if (daysLeft <= 3) {
      return <Badge variant="secondary">Expires in {daysLeft} days</Badge>
    }

    return <Badge variant="default">Active</Badge>
  }

  const getTimeRemaining = () => {
    if (!subscription || subscription.duration_days === null) {
      return "Lifetime Access"
    }

    const endDate = new Date(subscription.end_date)
    const now = new Date()
    const timeLeft = endDate.getTime() - now.getTime()

    if (timeLeft <= 0) {
      return "Expired"
    }

    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
    const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60))

    if (daysLeft >= 1) {
      return `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
    }

    return `${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} remaining`
  }

  if (loading) {
    return <SectionLoading title="Loading subscription details..." />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your subscription and access privileges</p>
      </div>

      {/* Subscription Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-yellow-600" />
              <div>
                <CardTitle>Subscription Status</CardTitle>
                <CardDescription>Your current subscription plan and status</CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {hasActiveSubscription && subscription ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Plan</span>
                  </div>
                  <p className="text-lg font-semibold">{subscription.package_name}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">Started</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {new Date(subscription.start_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-sm">
                      {subscription.duration_days ? "Expires" : "Access"}
                    </span>
                  </div>
                  <p className="text-lg font-semibold">
                    {subscription.duration_days 
                      ? new Date(subscription.end_date).toLocaleDateString()
                      : "Lifetime"
                    }
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-sm">Time Left</span>
                  </div>
                  <p className="text-lg font-semibold">{getTimeRemaining()}</p>
                </div>
              </div>

              {subscription.duration_days && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Reminder:</strong> Your subscription will expire on{" "}
                    <strong>{new Date(subscription.end_date).toLocaleDateString()}</strong>.
                    {" "}Consider renewing before it expires to maintain access.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-4">
                You don't have an active subscription. Get one to access our book collection.
              </p>
              <Button onClick={() => router.push("/subscriptions")}>
                View Subscription Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accessible Pages */}
      <Card>
        <CardHeader>
          <CardTitle>What You Can Access</CardTitle>
          <CardDescription>
            {hasActiveSubscription 
              ? "Pages and features available with your subscription"
              : "Get a subscription to access these features"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accessiblePages.map((page, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  hasActiveSubscription 
                    ? "border-green-200 bg-green-50 hover:bg-green-100" 
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${
                    hasActiveSubscription ? "bg-green-200 text-green-700" : "bg-gray-200 text-gray-500"
                  }`}>
                    {page.icon}
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      hasActiveSubscription ? "text-green-900" : "text-gray-700"
                    }`}>
                      {page.name}
                    </h4>
                    <p className={`text-sm ${
                      hasActiveSubscription ? "text-green-700" : "text-gray-500"
                    }`}>
                      {page.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant={hasActiveSubscription ? "default" : "secondary"}
                  size="sm"
                  onClick={() => router.push(page.href)}
                  disabled={!hasActiveSubscription}
                >
                  {hasActiveSubscription ? "Access" : "Locked"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => router.push("/subscriptions")}
          variant="outline"
        >
          {hasActiveSubscription ? "Upgrade Plan" : "Get Subscription"}
        </Button>
        
        {hasActiveSubscription && (
          <Button 
            onClick={() => router.push("/books")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Browse Books
          </Button>
        )}
      </div>
    </div>
  )
}