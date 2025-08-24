import { createClient } from "@/lib/server"
import { BooksGrid } from "@/components/books-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Download, Users, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  title: string
  author: string
  price: string
  description: string
  image_url: string
  download_url: string
  category: string
  tags: string[]
  isbn: string
  page_count: number
  file_size_mb: number
  language: string
  created_at: string
}

export default async function BooksPage() {
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

  // Fetch all books
  const { data: books, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching books:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Books</h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  const totalBooks = books?.length || 0

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            All Books Library
          </h1>
          <p className="text-gray-600 mt-2">
            Browse and download from our collection of {totalBooks} ebooks
          </p>
        </div>
      </div>

      {/* Subscription Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Access Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            hasActiveSubscription && subscriptionInfo ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    ✅ Active Subscription
                  </Badge>
                  <span className="text-sm font-medium">{subscriptionInfo.package_name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {subscriptionInfo.is_lifetime ? (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Lifetime Access - Download any book anytime!
                    </span>
                  ) : (
                    <span>
                      Valid until: {new Date(subscriptionInfo.end_date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                <p className="text-green-700 text-sm">
                  🎉 You can download any book from our entire collection!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    ⏳ No Active Subscription
                  </Badge>
                </div>
                <p className="text-gray-700 text-sm">
                  You need an active subscription to download books. You can still browse our collection and purchase individual books.
                </p>
                <div className="flex gap-2">
                  <Link href="/subscriptions">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Users className="h-4 w-4 mr-2" />
                      View Subscription Plans
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" size="sm">
                      Buy Individual Books
                    </Button>
                  </Link>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  👤 Not Logged In
                </Badge>
              </div>
              <p className="text-gray-700 text-sm">
                Please log in to access download features or subscribe for unlimited access.
              </p>
              <div className="flex gap-2">
                <Link href="/auth/login">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button variant="outline" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Books Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          All Books ({totalBooks})
        </h2>
        <BooksGrid 
          books={books || []} 
          hasActiveSubscription={hasActiveSubscription}
          isLoggedIn={!!user}
        />
      </div>
    </div>
  )
}