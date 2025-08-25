import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server"

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()
    
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if order exists and get details
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status")
      .eq("id", orderId)
      .single()

    if (orderError || !orderData) {
      return NextResponse.json({ 
        error: "Order not found", 
        details: orderError 
      }, { status: 404 })
    }

    // Get subscription items from order
    const { data: subscriptionItems, error: itemsError } = await supabase
      .from("order_items")
      .select("subscription_package_id, item_type")
      .eq("order_id", orderId)
      .eq("item_type", "subscription")
      .not("subscription_package_id", "is", null)

    if (itemsError) {
      return NextResponse.json({ 
        error: "Error fetching subscription items", 
        details: itemsError 
      }, { status: 500 })
    }

    if (!subscriptionItems || subscriptionItems.length === 0) {
      return NextResponse.json({ 
        error: "No subscription items found in order",
        orderData 
      }, { status: 400 })
    }

    console.log(`Found ${subscriptionItems.length} subscription items to activate`)
    const activationResults = []

    // Activate each subscription
    for (const item of subscriptionItems) {
      try {
        const { data: activationResult, error: activationError } = await supabase.rpc(
          'activate_subscription',
          {
            user_uuid: orderData.user_id,
            package_uuid: item.subscription_package_id,
            order_uuid: orderId
          }
        )

        if (activationError) {
          console.error(`Error activating subscription ${item.subscription_package_id}:`, activationError)
          activationResults.push({
            packageId: item.subscription_package_id,
            success: false,
            error: activationError.message
          })
        } else {
          console.log(`✅ Subscription ${item.subscription_package_id} activated`)
          activationResults.push({
            packageId: item.subscription_package_id,
            success: true,
            result: activationResult
          })
        }
      } catch (error) {
        console.error(`Failed to activate subscription ${item.subscription_package_id}:`, error)
        activationResults.push({
          packageId: item.subscription_package_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Update order status to completed
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId)

    return NextResponse.json({
      message: "Subscription activation attempted",
      orderId,
      orderUserId: orderData.user_id,
      subscriptionItems: subscriptionItems.length,
      activationResults,
      orderStatusUpdated: !updateError
    })

  } catch (error) {
    console.error("Error in manual activation:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}