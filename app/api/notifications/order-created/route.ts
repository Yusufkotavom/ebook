import { createClient } from "@/lib/server"
import { formatPriceServer } from "@/lib/currency-server"
import { type NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { orderId, email, customerName, paymentMethod } = await request.json()

    if (!orderId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

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

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        status,
        order_items(
          quantity,
          price,
          item_type,
          products(title, author),
          subscription_packages(name, duration_days)
        )
      `)
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Format price
    const formattedTotal = await formatPriceServer(order.total_amount)
    
    // Prepare order items for email
    const orderItemsPromises = order.order_items.map(async (item) => ({
      title: item.item_type === 'subscription' 
        ? (item.subscription_packages?.name || 'Subscription Package')
        : (item.products?.title || 'Unknown Product'),
      author: item.item_type === 'subscription' 
        ? 'Subscription Service'
        : (item.products?.author || 'Unknown Author'),
      price: await formatPriceServer(item.price),
      quantity: item.quantity,
      type: item.item_type
    }))
    
    const orderItems = await Promise.all(orderItemsPromises)

    // Generate order confirmation email
    const orderEmailData = {
      customerName: customerName || email.split('@')[0],
      customerEmail: email,
      orderId: orderId.slice(0, 8),
      orderTotal: formattedTotal,
      orderItems: orderItems,
      paymentMethod: paymentMethod || 'Manual Payment'
    }

    const emailData = emailService.generateOrderConfirmationEmail(orderEmailData)
    
    // Send email
    const emailResult = await emailService.sendEmail(emailData)

    // Log notification
    const { error: logError } = await supabase.from("notifications").insert([
      {
        order_id: orderId,
        type: "order_confirmation",
        recipient: email,
        message: `Order confirmation sent for order #${orderId.slice(0, 8)}`,
        status: emailResult.success ? 'sent' : 'failed',
        error_message: emailResult.error || null,
      },
    ])

    if (logError) {
      console.error("Error logging notification:", logError)
    }

    if (emailResult.success) {
      console.log(`✅ Order confirmation email sent to ${email}`)
      return NextResponse.json({ 
        success: true, 
        message: "Order confirmation email sent successfully",
        messageId: emailResult.messageId 
      })
    } else {
      console.error(`❌ Failed to send order confirmation email: ${emailResult.error}`)
      return NextResponse.json({ 
        error: `Failed to send email: ${emailResult.error}` 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error sending order confirmation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
