import { createClient } from "@/lib/server"
import { type NextRequest, NextResponse } from "next/server"

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

    // Create download links message
    const downloadLinks = order.order_items
      .filter((item) => item.products?.download_url)
      .map((item) => `${item.products?.title} by ${item.products?.author}: ${item.products?.download_url}`)
      .join("\n")

    const message = `Payment Confirmed! 🎉

Your order #${orderId.slice(0, 8)} has been processed successfully.

Download your ebooks:
${downloadLinks}

Total: $${Number.parseFloat(order.total_amount).toFixed(2)}

Thank you for your purchase!
- Ebook Store Team`

    // Log notification
    const { error: logError } = await supabase.from("notifications").insert([
      {
        order_id: orderId,
        type: "email",
        recipient: email,
        message: message,
      },
    ])

    if (logError) {
      console.error("Error logging notification:", logError)
    }

    // In production, send actual email with download links
    console.log(`Payment confirmation sent to ${email}`)
    console.log(`Message: ${message}`)

    return NextResponse.json({ success: true, message: "Payment confirmation sent" })
  } catch (error) {
    console.error("Error sending payment confirmation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
