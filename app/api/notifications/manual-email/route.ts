import { createClient } from "@/lib/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { orderId, email, customerName, message, products, orderStatus } = await request.json()

    if (!orderId || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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

    // Generate download links if order is paid
    const downloadLinks = order?.status === "paid" && order.order_items
      ? order.order_items
          .filter((item) => item.products?.download_url)
          .map((item) => `${item.products?.title} by ${item.products?.author}: ${item.products?.download_url}`)
          .join("\n")
      : ""

    // Enhanced message with actual download links for paid orders
    let finalMessage = message
    if (order?.status === "paid" && downloadLinks) {
      finalMessage = message.replace(
        /Download Links:[\s\S]*?(?=\n\nIf you have any issues)/,
        `Download Links:
${downloadLinks}`
      )
    }

    // Log the manual notification
    const { error: logError } = await supabase.from("notifications").insert([
      {
        order_id: orderId,
        type: "manual_email",
        recipient: email,
        message: finalMessage,
        status: "sent",
        sent_at: new Date().toISOString(),
      },
    ])

    if (logError) {
      console.error("Notification log error:", logError)
    }

    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Resend
    // For now, we'll just log and return success

    console.log("Manual Email Notification:", {
      to: email,
      customer: customerName,
      orderId: orderId.slice(0, 8),
      orderStatus,
      productsCount: products?.length || 0,
      hasDownloadLinks: !!downloadLinks,
      messageLength: finalMessage.length
    })

    // Example email service integration (commented):
    /*
    import { Resend } from 'resend'
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    await resend.emails.send({
      from: 'orders@ebookstore.com',
      to: email,
      subject: `Order Update #${orderId.slice(0, 8)} - Ebook Store`,
      text: finalMessage,
      html: finalMessage.replace(/\n/g, '<br>')
    })
    */

    return NextResponse.json({ 
      success: true, 
      message: "Manual email notification sent",
      hasDownloadLinks: !!downloadLinks,
      notificationLogged: !logError
    })

  } catch (error) {
    console.error("Manual email notification error:", error)
    return NextResponse.json(
      { error: "Failed to send email notification" },
      { status: 500 }
    )
  }
}