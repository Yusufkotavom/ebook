import * as brevo from '@getbrevo/brevo'
import nodemailer from 'nodemailer'

// Types for email configuration
export interface EmailConfig {
  provider: 'brevo_api' | 'brevo_smtp'
  brevo_api_key?: string
  smtp_host?: string
  smtp_port?: number
  smtp_user?: string
  smtp_pass?: string
  from_address: string
  from_name: string
  reply_to?: string
}

// Email template data
export interface EmailData {
  to: string
  subject: string
  htmlContent?: string
  textContent?: string
  templateData?: Record<string, any>
}

// Order confirmation email data
export interface OrderEmailData {
  customerName: string
  customerEmail: string
  orderId: string
  orderTotal: string
  orderItems: Array<{
    title: string
    author: string
    price: string
    quantity: number
  }>
  paymentInstructions?: string
}

class EmailService {
  private config: EmailConfig
  private brevoApi?: brevo.TransactionalEmailsApi
  private smtpTransporter?: nodemailer.Transporter

  constructor(config?: Partial<EmailConfig>) {
    // Load configuration from environment variables or passed config
    this.config = {
      provider: (config?.provider || process.env.EMAIL_PROVIDER as 'brevo_api' | 'brevo_smtp') || 'brevo_api',
      brevo_api_key: config?.brevo_api_key || process.env.BREVO_API_KEY,
      smtp_host: config?.smtp_host || process.env.SMTP_HOST,
      smtp_port: config?.smtp_port || parseInt(process.env.SMTP_PORT || '587'),
      smtp_user: config?.smtp_user || process.env.SMTP_USER,
      smtp_pass: config?.smtp_pass || process.env.SMTP_PASS,
      from_address: config?.from_address || process.env.EMAIL_FROM_ADDRESS || 'noreply@yourdomain.com',
      from_name: config?.from_name || process.env.EMAIL_FROM_NAME || 'Ebook Store',
      reply_to: config?.reply_to || process.env.EMAIL_REPLY_TO,
    }

    this.initializeService()
  }

  // Method to update configuration at runtime
  updateConfig(newConfig: Partial<EmailConfig>) {
    this.config = { ...this.config, ...newConfig }
    this.initializeService()
  }

  private initializeService() {
    try {
      if (this.config.provider === 'brevo_api' && this.config.brevo_api_key) {
        // Initialize Brevo API using the correct method
        try {
          // Create the transactional emails API instance
          this.brevoApi = new brevo.TransactionalEmailsApi()
          
          // Set the API key using the correct method
          this.brevoApi.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, this.config.brevo_api_key)
          
          console.log('✅ Brevo API initialized successfully')
        } catch (brevoError) {
          console.error('❌ Failed to initialize Brevo API:', brevoError)
          console.log('⚠️ Brevo API not available during build, will initialize at runtime')
        }
      } else if (this.config.provider === 'brevo_smtp' && this.config.smtp_host && this.config.smtp_user && this.config.smtp_pass) {
        // Initialize SMTP transporter
        this.smtpTransporter = nodemailer.createTransporter({
          host: this.config.smtp_host,
          port: this.config.smtp_port,
          secure: false, // true for 465, false for other ports
          auth: {
            user: this.config.smtp_user,
            pass: this.config.smtp_pass,
          },
        })
        console.log('✅ Brevo SMTP initialized successfully')
      }
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error)
    }
  }

  // Send generic email
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Debug logging
      console.log('🔍 Email service configuration:', {
        provider: this.config.provider,
        hasBrevoApi: !!this.brevoApi,
        hasSmtpTransporter: !!this.smtpTransporter,
        hasApiKey: !!this.config.brevo_api_key,
        hasSmtpConfig: !!(this.config.smtp_host && this.config.smtp_user && this.config.smtp_pass)
      })

      if (this.config.provider === 'brevo_api' && this.brevoApi) {
        return await this.sendViaBrevoAPI(emailData)
      } else if (this.config.provider === 'brevo_smtp' && this.smtpTransporter) {
        return await this.sendViaSMTP(emailData)
      } else {
        // More detailed error message
        let errorDetails = `Provider: ${this.config.provider}, `
        if (this.config.provider === 'brevo_api') {
          errorDetails += `Brevo API initialized: ${!!this.brevoApi}, API Key present: ${!!this.config.brevo_api_key}`
        } else if (this.config.provider === 'brevo_smtp') {
          errorDetails += `SMTP configured: ${!!this.smtpTransporter}, Host: ${this.config.smtp_host}, User: ${this.config.smtp_user}`
        }
        throw new Error(`Email service not properly configured: ${errorDetails}`)
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Send via Brevo API
  private async sendViaBrevoAPI(emailData: EmailData) {
    // Runtime initialization if not already done
    if (!this.brevoApi && this.config.brevo_api_key) {
      try {
        // Create the transactional emails API instance
        this.brevoApi = new brevo.TransactionalEmailsApi()
        
        // Set the API key using the correct method
        this.brevoApi.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, this.config.brevo_api_key)
        
        console.log('✅ Brevo API initialized at runtime')
      } catch (error) {
        console.error('❌ Failed to initialize Brevo API at runtime:', error)
        throw new Error(`Failed to initialize Brevo API: ${error}`)
      }
    }

    if (!this.brevoApi) {
      throw new Error('Brevo API not initialized - check your API key configuration')
    }

    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.to = [{ email: emailData.to }]
    sendSmtpEmail.sender = {
      email: this.config.from_address,
      name: this.config.from_name
    }
    sendSmtpEmail.subject = emailData.subject
    sendSmtpEmail.htmlContent = emailData.htmlContent
    sendSmtpEmail.textContent = emailData.textContent

    if (this.config.reply_to) {
      sendSmtpEmail.replyTo = { email: this.config.reply_to }
    }

    const response = await this.brevoApi.sendTransacEmail(sendSmtpEmail)
    
    return {
      success: true,
      messageId: response.body?.messageId || response.response?.req?.url
    }
  }

  // Send via SMTP
  private async sendViaSMTP(emailData: EmailData) {
    if (!this.smtpTransporter) {
      throw new Error('SMTP transporter not initialized')
    }

    const mailOptions = {
      from: `"${this.config.from_name}" <${this.config.from_address}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.textContent,
      html: emailData.htmlContent,
      replyTo: this.config.reply_to,
    }

    const info = await this.smtpTransporter.sendMail(mailOptions)
    
    return {
      success: true,
      messageId: info.messageId
    }
  }

  // Order confirmation email template
  generateOrderConfirmationEmail(orderData: OrderEmailData): EmailData {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .order-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .total { font-weight: bold; font-size: 1.2em; color: #4f46e5; padding-top: 15px; border-top: 2px solid #4f46e5; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
          .button { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📚 Order Confirmation</h1>
          <p>Thank you for your purchase!</p>
        </div>
        
        <div class="content">
          <h2>Hello ${orderData.customerName}!</h2>
          <p>Your order has been successfully placed. Here are the details:</p>
          
          <div class="order-details">
            <h3>Order #${orderData.orderId}</h3>
            
            <div style="margin: 20px 0;">
              <h4>Items Ordered:</h4>
              ${orderData.orderItems.map(item => `
                <div class="item">
                  <div>
                    <strong>${item.title}</strong><br>
                    <small>by ${item.author}</small><br>
                    <small>Quantity: ${item.quantity}</small>
                  </div>
                  <div style="text-align: right;">
                    <strong>${item.price}</strong>
                  </div>
                </div>
              `).join('')}
              
              <div class="total">
                Total: ${orderData.orderTotal}
              </div>
            </div>
            
            ${orderData.paymentInstructions ? `
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h4>Payment Instructions:</h4>
                <p>${orderData.paymentInstructions}</p>
              </div>
            ` : ''}
          </div>
          
          <p>You will receive download links once your payment is confirmed.</p>
          
          <div class="footer">
            <p>Questions? Contact us at ${this.config.reply_to || this.config.from_address}</p>
            <p>Thank you for choosing our Ebook Store!</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
      Order Confirmation - Ebook Store
      
      Hello ${orderData.customerName}!
      
      Your order has been successfully placed.
      
      Order #${orderData.orderId}
      
      Items Ordered:
      ${orderData.orderItems.map(item => `- ${item.title} by ${item.author} (Qty: ${item.quantity}) - ${item.price}`).join('\n')}
      
      Total: ${orderData.orderTotal}
      
      ${orderData.paymentInstructions ? `Payment Instructions:\n${orderData.paymentInstructions}\n` : ''}
      
      You will receive download links once your payment is confirmed.
      
      Questions? Contact us at ${this.config.reply_to || this.config.from_address}
      
      Thank you for choosing our Ebook Store!
    `

    return {
      to: orderData.customerEmail,
      subject: `Order Confirmation #${orderData.orderId} - Ebook Store`,
      htmlContent,
      textContent
    }
  }

  // Payment reminder email template
  generatePaymentReminderEmail(orderData: OrderEmailData & { orderDate: string }): EmailData {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #fffbeb; padding: 30px; border-radius: 0 0 8px 8px; }
          .order-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .total { font-weight: bold; font-size: 1.2em; color: #f59e0b; padding-top: 15px; border-top: 2px solid #f59e0b; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
          .button { display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .urgent { background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⏰ Payment Reminder</h1>
          <p>Complete your order to get your ebooks!</p>
        </div>
        
        <div class="content">
          <h2>Hello ${orderData.customerName}!</h2>
          <p>We noticed you haven't completed your payment yet. Your order is waiting for you!</p>
          
          <div class="urgent">
            <h3>📅 Order Details</h3>
            <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
            <p><strong>Order ID:</strong> #${orderData.orderId}</p>
          </div>
          
          <div class="order-details">
            <h3>📚 Your Order Items</h3>
            
            <div style="margin: 20px 0;">
              ${orderData.orderItems.map(item => `
                <div class="item">
                  <div>
                    <strong>${item.title}</strong><br>
                    <small>by ${item.author}</small><br>
                    <small>Quantity: ${item.quantity}</small>
                  </div>
                  <div style="text-align: right;">
                    <strong>${item.price}</strong>
                  </div>
                </div>
              `).join('')}
              
              <div class="total">
                Total: ${orderData.orderTotal}
              </div>
            </div>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4>💳 Complete Your Payment</h4>
            <p>To get your ebooks, please complete your payment using any of our payment methods:</p>
            <ul>
              <li>Bank Transfer (BCA, Mandiri, BNI)</li>
              <li>E-Wallet (OVO, DANA, GoPay)</li>
              <li>QRIS</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/checkout/payment?order=${orderData.orderId}" class="button">
              Complete Payment Now
            </a>
          </div>
          
          <div class="footer">
            <p>Need help? Contact us via WhatsApp: +6285799520350</p>
            <p>Thank you for choosing our Ebook Store!</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
      Payment Reminder - Ebook Store
      
      Hello ${orderData.customerName}!
      
      We noticed you haven't completed your payment yet. Your order is waiting for you!
      
      Order Details:
      Order Date: ${orderData.orderDate}
      Order ID: #${orderData.orderId}
      
      Your Order Items:
      ${orderData.orderItems.map(item => `- ${item.title} by ${item.author} (Qty: ${item.quantity}) - ${item.price}`).join('\n')}
      
      Total: ${orderData.orderTotal}
      
      Complete Your Payment:
      To get your ebooks, please complete your payment using any of our payment methods:
      - Bank Transfer (BCA, Mandiri, BNI)
      - E-Wallet (OVO, DANA, GoPay)
      - QRIS
      
      Complete Payment: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/checkout/payment?order=${orderData.orderId}
      
      Need help? Contact us via WhatsApp: +6285799520350
      
      Thank you for choosing our Ebook Store!
    `

    return {
      to: orderData.customerEmail,
      subject: `⏰ Payment Reminder - Complete Your Order #${orderData.orderId}`,
      htmlContent,
      textContent
    }
  }

  // Payment confirmation email template
  generatePaymentConfirmationEmail(orderData: OrderEmailData & { downloadLinks?: string[] }): EmailData {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
          .download-section { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .download-link { display: block; background-color: #10b981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; margin: 10px 0; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Payment Confirmed!</h1>
          <p>Your ebooks are ready for download</p>
        </div>
        
        <div class="content">
          <h2>Great news, ${orderData.customerName}!</h2>
          <p>Your payment for order #${orderData.orderId} has been confirmed.</p>
          
          <div class="download-section">
            <h3>📚 Your Ebooks</h3>
            <p>Click the links below to download your purchased ebooks:</p>
            
            ${orderData.orderItems.map((item, index) => `
              <a href="${(orderData as any).downloadLinks?.[index] || '#'}" class="download-link">
                📖 Download: ${item.title}
              </a>
            `).join('')}
          </div>
          
          <p><strong>Important:</strong> Download links are valid for 30 days. Please save your files to a secure location.</p>
          
          <div class="footer">
            <p>Need help? Contact us at ${this.config.reply_to || this.config.from_address}</p>
            <p>Thank you for your purchase!</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
      Payment Confirmed - Ebook Store
      
      Great news, ${orderData.customerName}!
      
      Your payment for order #${orderData.orderId} has been confirmed.
      
      Your Ebooks:
      ${orderData.orderItems.map((item, index) => `- ${item.title}: ${(orderData as any).downloadLinks?.[index] || 'Download link will be provided'}`).join('\n')}
      
      Important: Download links are valid for 30 days. Please save your files to a secure location.
      
      Need help? Contact us at ${this.config.reply_to || this.config.from_address}
      
      Thank you for your purchase!
    `

    return {
      to: orderData.customerEmail,
      subject: `✅ Payment Confirmed - Download Your Ebooks #${orderData.orderId}`,
      htmlContent,
      textContent
    }
  }

  // Test email functionality
  async sendTestEmail(toEmail: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const testEmailData: EmailData = {
      to: toEmail,
      subject: '🧪 Test Email from Ebook Store',
      htmlContent: `
        <h1>✅ Email Service Test</h1>
        <p>This is a test email to verify your Brevo email configuration.</p>
        <p><strong>Provider:</strong> ${this.config.provider}</p>
        <p><strong>From:</strong> ${this.config.from_name} &lt;${this.config.from_address}&gt;</p>
        <p>If you received this email, your email service is working correctly!</p>
      `,
      textContent: `
        Email Service Test
        
        This is a test email to verify your Brevo email configuration.
        Provider: ${this.config.provider}
        From: ${this.config.from_name} <${this.config.from_address}>
        
        If you received this email, your email service is working correctly!
      `
    }

    return await this.sendEmail(testEmailData)
  }
}

// Export singleton instance
export const emailService = new EmailService()
export default emailService

// Export the class for creating new instances
export { EmailService }