import { createClient } from "@/lib/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select(`
        id,
        start_date,
        end_date,
        is_active,
        subscription_packages(
          id,
          name,
          description,
          duration_days,
          features
        )
      `)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single()

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error("Error fetching subscription:", subscriptionError)
      return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
    }

    // Check if subscription is expired
    let isExpired = false
    let daysRemaining = 0
    
    if (subscription && subscription.end_date) {
      const now = new Date()
      const endDate = new Date(subscription.end_date)
      isExpired = now > endDate
      
      if (!isExpired) {
        const diffTime = endDate.getTime() - now.getTime()
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
    }

    // Get subscription history
    const { data: subscriptionHistory, error: historyError } = await supabase
      .from("user_subscriptions")
      .select(`
        id,
        start_date,
        end_date,
        is_active,
        created_at,
        subscription_packages(
          name,
          duration_days
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (historyError) {
      console.error("Error fetching subscription history:", historyError)
    }

    return NextResponse.json({
      success: true,
      subscription: subscription ? {
        ...subscription,
        isExpired,
        daysRemaining: isExpired ? 0 : daysRemaining
      } : null,
      subscriptionHistory: subscriptionHistory || [],
      hasActiveSubscription: !!(subscription && !isExpired)
    })

  } catch (error) {
    console.error("Error in subscription status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
