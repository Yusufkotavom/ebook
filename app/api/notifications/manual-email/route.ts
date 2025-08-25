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
          .filter((item) => item.products && Array.isArray(item.products) && item.products[0]?.download_url)
          .map((item) => {
            const product = Array.isArray(item.products) ? item.products[0] : null
            return `${product?.title || 'Unknown'} by ${product?.author || 'Unknown'}: ${product?.download_url}`
          })
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

    // Load email settings from database
    const { data: allSettings } = await supabase
      .from("app_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "email_provider", "brevo_api_key", "smtp_host", "smtp_port", 
        "smtp_user", "smtp_pass", "email_from_address", "email_from_name", "email_reply_to"
      ])

    // Convert to key-value object
    const emailConfig: any = {}
    allSettings?.forEach(setting => {
      emailConfig[setting.setting_key] = setting.setting_value
    })

    // Create email service instance with current settings
    const { EmailService } = await import("@/lib/email-service")
    const emailService = new EmailService({
      provider: emailConfig.email_provider as 'brevo_api' | 'brevo_smtp',
      brevo_api_key: emailConfig.brevo_api_key,
      smtp_host: emailConfig.smtp_host,
      smtp_port: parseInt(emailConfig.smtp_port || '587'),
      smtp_user: emailConfig.smtp_user,
      smtp_pass: emailConfig.smtp_pass,
      from_address: emailConfig.email_from_address || 'noreply@yourdomain.com',
      from_name: emailConfig.email_from_name || 'Ebook Store',
      reply_to: emailConfig.email_reply_to,
    })

    // Send the email using the email service
    const emailResult = await emailService.sendEmail({
      to: email,
      subject: `Order Update #${orderId.slice(0, 8)} - Ebook Store`,
      htmlContent: finalMessage.replace(/\n/g, '<br>'),
      textContent: finalMessage
    })

    console.log("Manual Email Notification:", {
      to: email,
      customer: customerName,
      orderId: orderId.slice(0, 8),
      orderStatus,
      productsCount: products?.length || 0,
      hasDownloadLinks: !!downloadLinks,
      messageLength: finalMessage.length,
      emailSent: emailResult.success,
      emailError: emailResult.error
    })

    return NextResponse.json({ 
      success: true, 
      message: "Manual email notification sent",
      hasDownloadLinks: !!downloadLinks,
      notificationLogged: !logError,
      emailSent: emailResult.success,
      emailError: emailResult.error
    })

  } catch (error) {
    console.error("Manual email notification error:", error)
    return NextResponse.json(
      { error: "Failed to send email notification" },
      { status: 500 }
    )
  }
}