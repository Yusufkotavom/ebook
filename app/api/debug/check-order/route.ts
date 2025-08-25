import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server"

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()
    
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // 1. Check if order exists
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (orderError || !orderData) {
      return NextResponse.json({ 
        error: "Order not found", 
        details: orderError,
        orderId 
      }, { status: 404 })
    }

    // 2. Check order items
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        *,
        products(title, author),
        subscription_packages(name, duration_days)
      `)
      .eq("order_id", orderId)

    if (itemsError) {
      return NextResponse.json({ 
        error: "Error fetching order items", 
        details: itemsError 
      }, { status: 500 })
    }

    // 3. Check current user subscriptions
    let userSubscriptions = null
    if (orderData.user_id) {
      const { data: subscriptions, error: subError } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          subscription_packages(name, duration_days)
        `)
        .eq("user_id", orderData.user_id)

      if (!subError) {
        userSubscriptions = subscriptions
      }
    }

    // 4. Check if RPC functions exist
    const { data: hasActiveSubResult, error: rpcError1 } = await supabase.rpc('has_active_subscription', {
      user_uuid: orderData.user_id || '00000000-0000-0000-0000-000000000000'
    })

    const { data: activeSubResult, error: rpcError2 } = await supabase.rpc('get_active_subscription', {
      user_uuid: orderData.user_id || '00000000-0000-0000-0000-000000000000'
    })

    // 5. Analyze the data
    const subscriptionItems = orderItems?.filter(item => item.item_type === 'subscription') || []
    const productItems = orderItems?.filter(item => item.item_type === 'product' || !item.item_type) || []

    return NextResponse.json({
      debug: "Order analysis complete",
      orderId,
      
      // Order details
      order: {
        id: orderData.id,
        user_id: orderData.user_id,
        status: orderData.status,
        total_amount: orderData.total_amount,
        created_at: orderData.created_at
      },

      // Order items breakdown
      orderItems: {
        total: orderItems?.length || 0,
        subscriptionItems: subscriptionItems.length,
        productItems: productItems.length,
        items: orderItems
      },

      // Current user subscriptions
      userSubscriptions: {
        count: userSubscriptions?.length || 0,
        subscriptions: userSubscriptions
      },

      // RPC function tests
      rpcTests: {
        hasActiveSubscription: {
          success: !rpcError1,
          result: hasActiveSubResult,
          error: rpcError1
        },
        getActiveSubscription: {
          success: !rpcError2,
          result: activeSubResult,
          error: rpcError2
        }
      },

      // Analysis
      analysis: {
        orderExists: !!orderData,
        hasSubscriptionItems: subscriptionItems.length > 0,
        orderIsCompleted: orderData.status === 'completed',
        userHasAccount: !!orderData.user_id,
        rpcFunctionsWork: !rpcError1 && !rpcError2
      },

      // Recommendations
      nextSteps: subscriptionItems.length === 0 
        ? ["No subscription items found in order - this might be a product-only order"]
        : orderData.status !== 'completed'
        ? ["Order status is not 'completed' - update order status first"]
        : !orderData.user_id
        ? ["Order has no user_id - guest orders cannot have subscriptions"]
        : ["Order looks good for subscription activation"]
    })

  } catch (error) {
    console.error("Error in order debug:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}