import { createClient } from "@/lib/server"
import { SubscriptionPackages } from "@/components/subscription-packages"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star, ArrowLeft, Users, Download, Clock } from "lucide-react"
import Link from "next/link"

export default async function SubscriptionsPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user has active subscription
  let hasActiveSubscription = false
  let subscriptionInfo = null

  if (user) {
    const { data: hasSubscription } = await supabase.rpc('has_active_subscription', { user_uuid: user.id })
    hasActiveSubscription = hasSubscription || false

    if (hasActiveSubscription) {
      const { data: subInfo } = await supabase.rpc('get_active_subscription', { user_uuid: user.id })
      subscriptionInfo = subInfo?.[0] || null
    }
  }

  // Fetch subscription packages
  const { data: packages, error } = await supabase
    .from("subscription_packages")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching subscription packages:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Subscriptions</h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Link href="/books">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </Button>
        </Link>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Users className="h-10 w-10 text-blue-600" />
            Subscription Plans
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for unlimited access to our entire ebook collection
          </p>
        </div>
      </div>

      {/* Current Subscription Status */}
      {user && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Your Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasActiveSubscription && subscriptionInfo ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    ✅ Active Subscription
                  </Badge>
                  <span className="text-lg font-medium">{subscriptionInfo.package_name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {subscriptionInfo.is_lifetime ? (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Star className="h-4 w-4" />
                      Lifetime Access - You're all set!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Valid until: {new Date(subscriptionInfo.end_date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                <p className="text-green-700">
                  🎉 You have unlimited access to download any book from our collection!
                </p>
                <Link href="/books">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Browse & Download Books
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    ⏳ No Active Subscription
                  </Badge>
                </div>
                <p className="text-gray-700">
                  Subscribe now to get unlimited access to our entire ebook collection with instant downloads.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Not Logged In Message */}
      {!user && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg">Ready to Get Started?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Sign up or log in to subscribe and get unlimited access to our entire ebook collection.
            </p>
            <div className="flex gap-2">
              <Link href="/auth/sign-up">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline">
                  Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center">What You Get With Any Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium">Unlimited Downloads</h3>
              <p className="text-sm text-gray-600">Download any book anytime</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium">Instant Access</h3>
              <p className="text-sm text-gray-600">No waiting, immediate downloads</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium">Premium Collection</h3>
              <p className="text-sm text-gray-600">Access to all 5000+ ebooks</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-medium">24/7 Support</h3>
              <p className="text-sm text-gray-600">Always here to help you</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Packages */}
      <div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Choose Your Plan
        </h2>
        <SubscriptionPackages 
          packages={packages || []} 
          currentUser={user}
          hasActiveSubscription={hasActiveSubscription}
        />
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Can I cancel my subscription anytime?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Yes, you can cancel anytime. Your access will continue until the end of your current billing period.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">What happens to my downloads if I cancel?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Any books you've already downloaded remain yours forever. You just won't be able to download new ones.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Is the lifetime plan really lifetime?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Yes! The lifetime plan gives you permanent access to our entire collection with no recurring fees.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Are there any hidden fees?</h3>
            <p className="text-sm text-gray-600 mt-1">
              No hidden fees. The price you see is exactly what you pay. No setup fees, no extra charges.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}