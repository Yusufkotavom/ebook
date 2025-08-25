import { createClient } from "@/lib/server"
import { formatPriceServer } from "@/lib/currency-server"
import { type NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { orderId, email } = await request.json()

    if (!orderId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Load email settings from database
    const { data: allSettings, error: settingsError } = await supabase
      .from("app_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "email_provider", "brevo_api_key", "smtp_host", "smtp_port", 
        "smtp_user", "smtp_pass", "email_from_address", "email_from_name", "email_reply_to"
      ])

    if (settingsError) {
      console.error("Error loading email settings:", settingsError)
      return NextResponse.json({ error: "Failed to load email configuration" }, { status: 500 })
    }

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
        // First, get subscription items from the order
        const { data: subscriptionItems, error: itemsError } = await supabase
          .from("order_items")
          .select("subscription_package_id")
          .eq("order_id", orderId)
          .eq("item_type", "subscription")
          .not("subscription_package_id", "is", null)

        if (itemsError) {
          console.error("Error fetching subscription items:", itemsError)
        } else if (subscriptionItems && subscriptionItems.length > 0) {
          console.log(`Found ${subscriptionItems.length} subscription items to activate`)
          
          // Get order details to find the user
          const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .select("user_id")
            .eq("id", orderId)
            .single()

          if (orderError || !orderData?.user_id) {
            console.error("Error fetching order user:", orderError)
          } else {
            // Activate each subscription
            for (const item of subscriptionItems) {
              try {
                const { error: activationError } = await supabase.rpc(
                  'activate_subscription',
                  {
                    user_uuid: orderData.user_id,
                    package_uuid: item.subscription_package_id,
                    order_uuid: orderId
                  }
                )

                if (activationError) {
                  console.error(`Error activating subscription ${item.subscription_package_id}:`, activationError)
                } else {
                  console.log(`✅ Subscription ${item.subscription_package_id} activated for user ${orderData.user_id}`)
                }
              } catch (error) {
                console.error(`Failed to activate subscription ${item.subscription_package_id}:`, error)
              }
            }
          }
        } else {
          console.log("No subscription items found in order")
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
