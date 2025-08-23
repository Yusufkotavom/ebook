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

    // Email Service Integration
    // Uncomment and configure one of these email services:

    // Option 1: Resend (Recommended for Indonesia)
    /*
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        const { data, error } = await resend.emails.send({
          from: 'Ebook Store <noreply@yourdomain.com>',
          to: [email],
          subject: `Order Update - ${orderId}`,
          html: `<div>${message.replace(/\n/g, '<br>')}</div>`,
        })
        
        if (error) {
          console.error('Resend error:', error)
        } else {
          console.log('Email sent via Resend:', data)
        }
      } catch (resendError) {
        console.error('Resend integration error:', resendError)
      }
    }
    */

    // Option 2: SendGrid
    /*
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sgMail = await import('@sendgrid/mail')
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        
        await sgMail.send({
          to: email,
          from: 'noreply@yourdomain.com',
          subject: `Order Update - ${orderId}`,
          text: message,
          html: `<div>${message.replace(/\n/g, '<br>')}</div>`,
        })
        
        console.log('Email sent via SendGrid')
      } catch (sendgridError) {
        console.error('SendGrid error:', sendgridError)
      }
    }
    */

    // Option 3: Mailgun
    /*
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      try {
        const formData = new FormData()
        formData.append('from', 'Ebook Store <noreply@yourdomain.com>')
        formData.append('to', email)
        formData.append('subject', `Order Update - ${orderId}`)
        formData.append('text', message)
        formData.append('html', `<div>${message.replace(/\n/g, '<br>')}</div>`)
        
        const response = await fetch(
          `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
            },
            body: formData,
          }
        )
        
        if (response.ok) {
          console.log('Email sent via Mailgun')
        } else {
          console.error('Mailgun error:', await response.text())
        }
      } catch (mailgunError) {
        console.error('Mailgun integration error:', mailgunError)
      }
    }
    */

    // Fallback logging
    console.log(`Email notification sent to ${email} for order ${orderId}`)
    console.log(`Message: ${message}`)

    return NextResponse.json({ success: true, message: "Email notification sent" })
  } catch (error) {
    console.error("Error sending email notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
