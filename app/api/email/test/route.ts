import { NextRequest, NextResponse } from "next/server"
import emailService from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { toEmail, settings } = await request.json()

    if (!toEmail) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      )
    }

    // Temporarily update environment variables for testing
    if (settings) {
      // Update process.env for this test
      process.env.EMAIL_PROVIDER = settings.email_provider
      process.env.BREVO_API_KEY = settings.brevo_api_key
      process.env.SMTP_HOST = settings.smtp_host
      process.env.SMTP_PORT = settings.smtp_port
      process.env.SMTP_USER = settings.smtp_user
      process.env.SMTP_PASS = settings.smtp_pass
      process.env.EMAIL_FROM_ADDRESS = settings.email_from_address
      process.env.EMAIL_FROM_NAME = settings.email_from_name
      process.env.EMAIL_REPLY_TO = settings.email_reply_to
    }

    // Create a new email service instance with updated settings
    const testEmailService = new (require("@/lib/email-service").default.constructor)()
    
    // Send test email
    const result = await testEmailService.sendTestEmail(toEmail)

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: `Test email sent successfully to ${toEmail}`
      })
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send test email" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in test email endpoint:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    )
  }
}