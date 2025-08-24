"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Lock, Clock, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useCurrency } from "@/contexts/currency-context"
import { toast } from "react-hot-toast"
import type { User } from "@supabase/supabase-js"

interface Product {
  id: string
  title: string
  author: string
  description: string
  price: number
  image_url: string
  download_url: string
  is_active: boolean
  created_at: string
}

interface SubscriptionStatus {
  hasActiveSubscription: boolean
  subscriptionData: {
    id: string
    subscription_package_id: string
    start_date: string
    end_date: string
    package_name: string
    duration_days: number
  } | null
}

export function BooksDownloadPage() {
  const [books, setBooks] = useState<Product[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    subscriptionData: null
  })
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const { formatPrice } = useCurrency()
  const router = useRouter()

  useEffect(() => {
    checkUserAndSubscription()
    fetchBooks()
  }, [])

  const checkUserAndSubscription = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setUser(null)
        return
      }

      setUser(user)

      // Check active subscription
      const { data: hasActiveSub } = await supabase.rpc('has_active_subscription', {
        user_uuid: user.id
      })

      if (hasActiveSub) {
        const { data: subData } = await supabase.rpc('get_active_subscription', {
          user_uuid: user.id
        })

        if (subData && subData.length > 0) {
          setSubscriptionStatus({
            hasActiveSubscription: true,
            subscriptionData: subData[0]
          })
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error)
    }
  }

  const fetchBooks = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error("Error fetching books:", error)
      toast.error("Failed to load books")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (bookId: string) => {
    if (!user) {
      toast.error("Please login to download books")
      router.push("/auth/login")
      return
    }

    if (!subscriptionStatus.hasActiveSubscription) {
      toast.error("You need an active subscription to download books")
      router.push("/subscriptions")
      return
    }

    setDownloadingId(bookId)

    try {
      // Step 1: Generate download token
      const response = await fetch("/api/books/generate-download-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: bookId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate download token")
      }

      const { downloadToken, expiresAt } = await response.json()

      // Step 2: Use token to download
      const downloadResponse = await fetch(`/api/books/download/${bookId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ downloadToken }),
      })

      if (!downloadResponse.ok) {
        throw new Error("Download failed")
      }

      // Step 3: Handle file download
      const blob = await downloadResponse.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `book-${bookId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      const expiryTime = new Date(expiresAt).toLocaleTimeString()
      toast.success(`Download started! Token expires at ${expiryTime}`)
    } catch (error) {
      console.error("Download error:", error)
      toast.error(error instanceof Error ? error.message : "Download failed")
    } finally {
      setDownloadingId(null)
    }
  }

  const getSubscriptionStatusBadge = () => {
    if (!user) {
      return <Badge variant="secondary">Not Logged In</Badge>
    }
    
    if (!subscriptionStatus.hasActiveSubscription) {
      return <Badge variant="destructive">No Active Subscription</Badge>
    }

    const { subscriptionData } = subscriptionStatus
    if (!subscriptionData) return null

    const endDate = new Date(subscriptionData.end_date)
    const now = new Date()
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (subscriptionData.duration_days === null) {
      return <Badge variant="default" className="bg-purple-600">Lifetime Access</Badge>
    }

    if (daysLeft <= 1) {
      return <Badge variant="destructive">Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</Badge>
    }

    if (daysLeft <= 7) {
      return <Badge variant="secondary">Expires in {daysLeft} days</Badge>
    }

    return <Badge variant="default">{subscriptionData.package_name}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book Downloads</h1>
            <p className="text-gray-600 mt-2">Access your downloaded books with an active subscription</p>
          </div>
          <div className="flex items-center gap-3">
            {getSubscriptionStatusBadge()}
            {!user && (
              <Button onClick={() => router.push("/auth/login")} size="sm">
                Login
              </Button>
            )}
            {user && !subscriptionStatus.hasActiveSubscription && (
              <Button onClick={() => router.push("/subscriptions")} size="sm">
                Get Subscription
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      {subscriptionStatus.hasActiveSubscription && subscriptionStatus.subscriptionData && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">Active Subscription</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-700">Plan:</span>{" "}
                <span className="text-green-600">{subscriptionStatus.subscriptionData.package_name}</span>
              </div>
              <div>
                <span className="font-medium text-green-700">Started:</span>{" "}
                <span className="text-green-600">
                  {new Date(subscriptionStatus.subscriptionData.start_date).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-green-700">
                  {subscriptionStatus.subscriptionData.duration_days ? "Expires:" : "Access:"}
                </span>{" "}
                <span className="text-green-600">
                  {subscriptionStatus.subscriptionData.duration_days 
                    ? new Date(subscriptionStatus.subscriptionData.end_date).toLocaleDateString()
                    : "Lifetime"
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Access Message */}
      {!subscriptionStatus.hasActiveSubscription && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Subscription Required</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              You need an active subscription to download books. Choose a plan that fits your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/subscriptions")} className="bg-orange-600 hover:bg-orange-700">
              View Subscription Plans
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <Card key={book.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="relative h-48 w-full mb-3">
                <Image
                  src={book.image_url || "/placeholder.svg?height=192&width=128&query=book cover"}
                  alt={book.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
              <CardDescription className="text-sm">by {book.author}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{book.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Price:</span>
                  <span className="font-semibold">{formatPrice(book.price)}</span>
                </div>
                
                <Button
                  onClick={() => handleDownload(book.id)}
                  disabled={!subscriptionStatus.hasActiveSubscription || downloadingId === book.id}
                  className="w-full"
                  variant={subscriptionStatus.hasActiveSubscription ? "default" : "secondary"}
                >
                  {downloadingId === book.id ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : subscriptionStatus.hasActiveSubscription ? (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Subscription Required
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {books.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No books available</h3>
          <p className="text-gray-600">Check back later for new releases.</p>
        </div>
      )}
    </div>
  )
}