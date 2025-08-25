"use client"

import type React from "react"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ButtonSpinner, CardLoader } from "@/components/ui/spinner"
import { CheckoutCart } from "@/components/checkout-cart"
import { useCart } from "@/hooks/use-cart"
import { useCurrency } from "@/contexts/currency-context"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  full_name?: string
  whatsapp_number?: string
}

export default function CheckoutPage() {
  const { state, clearCart, removeFromCart } = useCart()
  const { formatPrice } = useCurrency()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [selectedTotal, setSelectedTotal] = useState(0)
  const [loadingStep, setLoadingStep] = useState<string>("")
  const router = useRouter()

  // Handle selected items change from CheckoutCart
  const handleSelectedItemsChange = useCallback((items: any[], total: number) => {
    setSelectedItems(items)
    setSelectedTotal(total)
  }, [])

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
    setLoadingStep("Validating order...")

    // Validate selected items
    if (selectedItems.length === 0) {
      setError("Please select at least one item to checkout")
      setIsLoading(false)
      return
    }

    // Validate required fields
    if (!fullName.trim()) {
      setError("Full name is required")
      setIsLoading(false)
      return
    }

    if (!email.trim()) {
      setError("Email is required")
      setIsLoading(false)
      return
    }

    // For guest users, validate password
    if (!user) {
      if (!password.trim()) {
        setError("Password is required")
        setIsLoading(false)
        return
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters")
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        setIsLoading(false)
        return
      }
    }

    const supabase = createClient()

    try {
      console.log("[v0] Starting checkout process")

      let userId = user?.id

      if (!userId) {
        setLoadingStep("Creating your account...")
        console.log("[v0] Creating new user account during checkout")

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
              whatsapp_number: whatsappNumber.trim()
            },
          },
        })

        if (signUpError) {
          console.log("[v0] Signup error:", signUpError)
          
          // If user already exists, try to sign them in
          if (signUpError.message.includes("already registered") || signUpError.message.includes("already been registered")) {
            setError("An account with this email already exists. Please sign in first or use a different email.")
            setIsLoading(false)
            return
          } else {
            throw signUpError
          }
        } else {
          userId = signUpData.user?.id
          console.log("[v0] New user created and signed in:", userId)
          
          // Create/update profile for new user
          if (userId) {
            const { error: profileError } = await supabase
              .from("profiles")
              .upsert({
                id: userId,
                email: email.trim(),
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

      setLoadingStep("Creating your order...")
      console.log("[v0] Creating order")

      const orderData = {
        user_id: userId,
        total_amount: selectedTotal,
        status: "pending" as const,
        payment_method: "manual",
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

      // Create order items and handle subscriptions
      setLoadingStep("Processing items...")
      
      // Separate subscription items from regular products
      const subscriptionItems = selectedItems.filter(item => item.isSubscription)
      const regularItems = selectedItems.filter(item => !item.isSubscription)
      
      // Handle regular product items
      if (regularItems.length > 0) {
        const orderItems = regularItems.map((item) => ({
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
      }

      // Handle subscription items
      if (subscriptionItems.length > 0) {
        setLoadingStep("Processing subscription...")
        
        const subscriptionOrderItems = subscriptionItems.map((item) => ({
          order_id: createdOrder.id,
          product_id: null, // No product ID for subscriptions
          subscription_package_id: item.subscriptionPackageId,
          item_type: 'subscription',
          quantity: 1,
          price: item.price,
        }))

        console.log("[v0] Creating subscription items:", subscriptionOrderItems)
        const { error: subItemsError } = await supabase
          .from("order_items")
          .insert(subscriptionOrderItems)

        if (subItemsError) {
          console.log("[v0] Subscription items error:", subItemsError)
          throw subItemsError
        }

        console.log("[v0] Subscription items created successfully")
      }

      setLoadingStep("Finalizing order...")
      console.log("[v0] Checkout completed successfully")
      
      // Send order confirmation email
      try {
        setLoadingStep("Sending confirmation email...")
        const emailResponse = await fetch("/api/notifications/order-created", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: createdOrder.id,
            email: email.trim(),
            customerName: fullName.trim(),
            paymentMethod: "Manual Payment"
          }),
        })

        if (emailResponse.ok) {
          console.log("[v0] Order confirmation email sent successfully")
        } else {
          console.log("[v0] Failed to send order confirmation email")
        }
      } catch (emailError) {
        console.log("[v0] Email error (non-blocking):", emailError)
        // Email error shouldn't block checkout completion
      }
      
      // Remove only selected items from cart (keep unselected for future purchase)
      selectedItems.forEach(item => {
        removeFromCart(item.id)
      })
      
      setLoadingStep("Redirecting to payment...")
      router.push(`/checkout/payment?order=${createdOrder.id}&total=${selectedTotal}`)
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </CardHeader>
              <CardContent>
                <CardLoader rows={5} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </CardHeader>
              <CardContent>
                <CardLoader rows={8} />
              </CardContent>
            </Card>
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
          {/* Enhanced Order Summary with Quantity Controls & Selection */}
          <CheckoutCart onSelectedItemsChange={handleSelectedItemsChange} />

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {user ? "Contact Information" : "Create Account & Checkout"}
              </CardTitle>
              <CardDescription>
                {user 
                  ? "Your download links will be sent to your registered email" 
                  : "Create your account and complete your purchase in one step"
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
                  /* Guest user - account creation fields */
                  <>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will be your account email
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="password">Create Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        disabled={isLoading}
                      />
                    </div>
                  </>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional - for order notifications and support
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Payment Method</h4>
                  <p className="text-sm text-yellow-700">
                    Manual payment processing. After placing your order, you'll receive payment instructions.
                    Your download links will be sent once payment is confirmed.
                  </p>
                </div>

                {!user && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Account Benefits</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Track your orders and download history</li>
                      <li>• Faster checkout for future purchases</li>
                      <li>• Access your ebooks anytime</li>
                      <li>• Receive order updates and support</li>
                    </ul>
                  </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  disabled={isLoading || isCheckingAuth || selectedItems.length === 0}
                >
                  {isLoading && <ButtonSpinner />}
                  {selectedItems.length === 0 
                    ? "Select items to checkout"
                    : isLoading 
                      ? loadingStep || (user ? "Processing..." : "Creating Account & Order...") 
                      : (user ? `Place Order (${formatPrice(selectedTotal)})` : `Create Account & Place Order (${formatPrice(selectedTotal)})`)
                  }
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
                        disabled={isLoading}
                      >
                        Sign in instead
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
