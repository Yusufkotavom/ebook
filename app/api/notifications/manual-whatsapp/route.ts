import { createClient } from "@/lib/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { orderId, whatsappNumber, customerName, message, products, orderStatus } = await request.json()

    if (!orderId || !whatsappNumber || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Clean WhatsApp number (remove any non-numeric characters except +)
    const cleanNumber = whatsappNumber.replace(/[^0-9+]/g, '')
    
    const supabase = await createClient()

    // Get order details with download links for paid orders
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        status,
        order_items(
          quantity,
          price,
          products(title, author, download_url)
        )
      `)
      .eq("id", orderId)
      .single()

    if (orderError) {
      console.error("Order fetch error:", orderError)
    }

    // For WhatsApp, we'll include a link to the customer dashboard instead of direct download links
    const dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourstore.com'}/dashboard/orders`
    
    // Enhanced message for WhatsApp with dashboard link for paid orders
    let finalMessage = message
    if (order?.status === "paid") {
      finalMessage += `\n\n🔗 Access your downloads here: ${dashboardLink}`
    }

    // Log the manual notification
    const { error: logError } = await supabase.from("notifications").insert([
      {
        order_id: orderId,
        type: "manual_whatsapp",
        recipient: cleanNumber,
        message: finalMessage,
        status: "sent",
        sent_at: new Date().toISOString(),
      },
    ])

    if (logError) {
      console.error("Notification log error:", logError)
    }

    // In a real implementation, you would integrate with a WhatsApp Business API like:
    // - WhatsApp Business API
    // - Twilio WhatsApp API
    // - MessageBird WhatsApp API
    // - Vonage WhatsApp API
    // For now, we'll just log and return success

    console.log("Manual WhatsApp Notification:", {
      to: cleanNumber,
      customer: customerName,
      orderId: orderId.slice(0, 8),
      orderStatus,
      productsCount: products?.length || 0,
      messageLength: finalMessage.length,
      includesDashboardLink: order?.status === "paid"
    })

    // Example WhatsApp API integration (commented):
    /*
    import twilio from 'twilio'
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    
    await client.messages.create({
      from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
      to: `whatsapp:${cleanNumber}`,
      body: finalMessage
    })
    */

    // Generate WhatsApp URL for manual sending
    const whatsappUrl = `https://wa.me/${cleanNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(finalMessage)}`

    return NextResponse.json({ 
      success: true, 
      message: "Manual WhatsApp notification prepared",
      whatsappUrl,
      cleanNumber,
      includesDashboardLink: order?.status === "paid",
      notificationLogged: !logError
    })

  } catch (error) {
    console.error("Manual WhatsApp notification error:", error)
    return NextResponse.json(
      { error: "Failed to send WhatsApp notification" },
      { status: 500 }
    )
  }
}