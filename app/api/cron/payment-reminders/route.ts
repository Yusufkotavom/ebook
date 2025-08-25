import { createClient } from "@/lib/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret if needed
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Find orders that are:
    // 1. Still pending (not paid/cancelled)
    // 2. Created more than 6 hours ago
    // 3. Haven't received a reminder in the last 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    
    const { data: pendingOrders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        status,
        created_at,
        user_id,
        guest_email,
        guest_name,
        profiles(email, full_name)
      `)
      .eq("status", "pending")
      .lt("created_at", sixHoursAgo)
      .not("id", "in", (
        `(SELECT order_id FROM notifications WHERE type = 'payment_reminder' AND created_at >= '${sixHoursAgo}')`
      ))

    if (ordersError) {
      console.error("Error fetching pending orders:", ordersError)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No orders need reminders",
        count: 0
      })
    }

    console.log(`Found ${pendingOrders.length} orders that need payment reminders`)

    let successCount = 0
    let errorCount = 0

    // Process each order
    for (const order of pendingOrders) {
      try {
        const customerEmail = order.profiles?.email || order.guest_email
        const customerName = order.profiles?.full_name || order.guest_name

        if (!customerEmail) {
          console.log(`Order ${order.id} has no email, skipping`)
          continue
        }

        // Send payment reminder
        const reminderResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/notifications/payment-reminder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            email: customerEmail,
            customerName: customerName
          }),
        })

        if (reminderResponse.ok) {
          successCount++
          console.log(`✅ Payment reminder sent for order ${order.id}`)
        } else {
          errorCount++
          console.log(`❌ Failed to send reminder for order ${order.id}`)
        }

        // Small delay to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        errorCount++
        console.error(`Error processing order ${order.id}:`, error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Payment reminders processed",
      total: pendingOrders.length,
      successCount,
      errorCount
    })

  } catch (error) {
    console.error("Payment reminders cron job error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Also support GET for manual testing
export async function GET() {
  return NextResponse.json({ 
    message: "Payment reminders cron job endpoint",
    usage: "POST to run the job, requires authorization header if CRON_SECRET is set"
  })
}
