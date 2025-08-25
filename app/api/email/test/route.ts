import { NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { toEmail, settings } = await request.json()

    if (!toEmail) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      )
    }

    if (!settings) {
      return NextResponse.json(
        { error: "Email settings are required" },
        { status: 400 }
      )
    }

    // Create email service with the provided settings
    const emailService = new EmailService({
      provider: settings.email_provider as 'brevo_api' | 'brevo_smtp',
      brevo_api_key: settings.brevo_api_key,
      smtp_host: settings.smtp_host,
      smtp_port: parseInt(settings.smtp_port),
      smtp_user: settings.smtp_user,
      smtp_pass: settings.smtp_pass,
      from_address: settings.email_from_address,
      from_name: settings.email_from_name,
      reply_to: settings.email_reply_to,
    })
    
    // Send test email
    const result = await emailService.sendTestEmail(toEmail)

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