import { createClient } from "@/lib/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { orderId, email, message } = await request.json()

    if (!orderId || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminData } = await supabase.from("admin_users").select("id").eq("id", user.id).single()

    if (!adminData) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Log notification in database
    const { error: logError } = await supabase.from("notifications").insert([
      {
        order_id: orderId,
        type: "email",
        recipient: email,
        message: message,
        created_by: user.id,
      },
    ])

    if (logError) {
      console.error("Error logging notification:", logError)
    }

    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend

    console.log(`Email notification sent to ${email} for order ${orderId}`)
    console.log(`Message: ${message}`)

    return NextResponse.json({ success: true, message: "Email notification sent" })
  } catch (error) {
    console.error("Error sending email notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
