"use client"

import type React from "react"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/hooks/use-cart"
import { useCurrency } from "@/contexts/currency-context"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  full_name?: string
  whatsapp_number?: string
}

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const { formatPrice } = useCurrency()
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  // Check if user is logged in when component mounts
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (currentUser) {
        setUser(currentUser)
        setEmail(currentUser.email || "")
        
        // Fetch user profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, whatsapp_number")
          .eq("id", currentUser.id)
          .single()
          
        if (profile) {
          setUserProfile(profile)
          setFullName(profile.full_name || "")
          setWhatsappNumber(profile.whatsapp_number || "")
        }
      }
      setIsCheckingAuth(false)
    }
    
    checkUser()
  }, [])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate required fields
    if (!fullName.trim()) {
      setError("Full name is required")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      console.log("[v0] Starting checkout process")

      let userId = user?.id

      if (!userId) {
        console.log("[v0] Creating new user for checkout")
        const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
            data: {
              email_confirm: true, // Skip email verification for local testing
              full_name: fullName.trim(),
              whatsapp_number: whatsappNumber.trim()
            },
          },
        })

        if (signUpError) {
          console.log("[v0] Signup error:", signUpError)
          // If user already exists, try to sign them in with a different approach
          if (signUpError.message.includes("already registered")) {
            // For existing users, we'll create the order without authentication
            // This is a simplified approach for manual payment processing
            console.log("[v0] User exists, proceeding with guest checkout")
          } else {
            throw signUpError
          }
        } else {
          userId = signUpData.user?.id
          console.log("[v0] New user created:", userId)
          
          // Create/update profile for new user
          if (userId) {
            const { error: profileError } = await supabase
              .from("profiles")
              .upsert({
                id: userId,
                email: email,
                full_name: fullName.trim(),
                whatsapp_number: whatsappNumber.trim()
              })
            
            if (profileError) {
              console.error("Profile creation error:", profileError)
            }
          }
        }
      } else {
        // Update existing user profile if data has changed
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({
            full_name: fullName.trim(),
            whatsapp_number: whatsappNumber.trim()
          })
          .eq("id", userId)
          
        if (profileUpdateError) {
          console.error("Profile update error:", profileUpdateError)
        }
      }

      console.log("[v0] Creating order")

      const orderData = {
        user_id: userId || null, // Allow null for guest checkout
        total_amount: state.total,
        status: "pending" as const,
        payment_method: "manual",
        guest_email: !userId ? email : null, // Store guest email if no user ID
        guest_name: !userId ? fullName.trim() : null, // Store guest name if no user ID
        guest_whatsapp: !userId ? whatsappNumber.trim() : null, // Store guest WhatsApp if no user ID
      }

      const { data: createdOrder, error: orderError } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single()

      if (orderError) {
        console.log("[v0] Order creation error:", orderError)
        throw orderError
      }

      console.log("[v0] Order created:", createdOrder.id)

      // Create order items
      const orderItems = state.items.map((item) => ({
        order_id: createdOrder.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }))

      console.log("[v0] Creating order items:", orderItems)

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.log("[v0] Order items error:", itemsError)
        throw itemsError
      }

      console.log("[v0] Checkout completed successfully")
      clearCart()
      router.push(`/checkout/payment?order=${createdOrder.id}&total=${state.total}`)
    } catch (error: unknown) {
      console.log("[v0] Checkout error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during checkout")
    } finally {
      setIsLoading(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Your cart is empty</p>
            <Button className="mt-4" onClick={() => router.push("/")}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>{state.itemCount} items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="relative h-16 w-12">
                      <Image
                        src={item.image_url || "/placeholder.svg?height=64&width=48&query=book cover"}
                        alt={item.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500">by {item.author}</p>
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatPrice(state.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                {user 
                  ? "Your download links will be sent to your registered email" 
                  : "We'll send your download links to this email"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-4">
                {user && (
                  /* Logged in user - show email info */
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-green-900">Logged in as</p>
                        <p className="text-sm text-green-700">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!user && (
                  /* Guest user - email field */
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      An account will be created automatically if you don't have one
                    </p>
                  </div>
                )}

                {/* Full Name - always required */}
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                {/* WhatsApp Number - optional */}
                <div>
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+62812345678"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional - for order notifications and support
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Payment Method</h4>
                  <p className="text-sm text-yellow-700">
                    Manual payment processing. After placing your order, you'll receive payment instructions via email.
                    Your download links will be sent once payment is confirmed.
                  </p>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" className="w-full" size="lg" disabled={isLoading || isCheckingAuth}>
                  {isLoading ? "Processing..." : "Place Order"}
                </Button>

                {!user && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-blue-600 hover:text-blue-800"
                        onClick={() => router.push('/auth/login')}
                        type="button"
                      >
                        Sign in
                      </Button>
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
