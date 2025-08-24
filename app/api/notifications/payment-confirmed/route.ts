import { createClient } from "@/lib/server"
import { formatPriceServer } from "@/lib/currency-server"
import { type NextRequest, NextResponse } from "next/server"
import emailService from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { orderId, email } = await request.json()

    if (!orderId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get order details with download links
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        order_items(
          products(title, author, download_url)
        )
      `)
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Format individual item prices
    const itemPrice = await formatPriceServer(order.total_amount / order.order_items.length)
    
    // Prepare order data for email template
    const orderItems = order.order_items.map((item, index) => ({
      title: item.products?.title || 'Unknown Product',
      author: item.products?.author || 'Unknown Author',
      price: itemPrice, // Use pre-formatted price
      quantity: 1
    }))

    const downloadLinks = order.order_items
      .filter((item) => item.products?.download_url)
      .map((item) => item.products?.download_url)

    // Format price using the current currency system
    const formattedTotal = await formatPriceServer(order.total_amount)

    // Generate email using template
    const orderEmailData = {
      customerName: email.split('@')[0], // Extract name from email as fallback
      customerEmail: email,
      orderId: orderId.slice(0, 8),
      orderTotal: formattedTotal,
      orderItems: orderItems,
      downloadLinks: downloadLinks
    }

    const emailData = emailService.generatePaymentConfirmationEmail(orderEmailData)
    
    // Send actual email
    const emailResult = await emailService.sendEmail(emailData)

    // Update order status to completed and activate subscriptions
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId)

    if (updateError) {
      console.error("Error updating order status:", updateError)
    } else {
      console.log(`✅ Order ${orderId} marked as completed`)
      
      // Check if order contains subscriptions and activate them
      try {
        const { error: activationError } = await supabase.rpc(
          'activate_subscription_from_order', 
          { order_uuid: orderId }
        )
        
        if (activationError) {
          console.error("Error activating subscriptions:", activationError)
        } else {
          console.log(`✅ Subscriptions activated for order ${orderId}`)
        }
      } catch (subError) {
        console.error("Subscription activation failed:", subError)
      }
    }

    // Create message for logging
    const logMessage = `Payment Confirmed! Order #${orderId.slice(0, 8)} - Total: ${formattedTotal}`

    // Log notification
    const { error: logError } = await supabase.from("notifications").insert([
      {
        order_id: orderId,
        type: "email",
        recipient: email,
        message: logMessage,
        status: emailResult.success ? 'sent' : 'failed',
        error_message: emailResult.error || null,
      },
    ])

    if (logError) {
      console.error("Error logging notification:", logError)
    }

    if (emailResult.success) {
      console.log(`✅ Payment confirmation email sent to ${email}`)
      return NextResponse.json({ 
        success: true, 
        message: "Payment confirmation sent successfully",
        messageId: emailResult.messageId 
      })
    } else {
      console.error(`❌ Failed to send payment confirmation email: ${emailResult.error}`)
      return NextResponse.json({ 
        error: `Failed to send email: ${emailResult.error}` 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error sending payment confirmation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
