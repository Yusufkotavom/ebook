// WhatsApp Support Configuration
export const WHATSAPP_CONFIG = {
  number: "6285799520350", // WhatsApp number without + sign
  baseUrl: "https://wa.me/"
}

// Message templates for different situations
export const WHATSAPP_MESSAGES = {
  // General support
  general: "Hello! I need assistance with your ebook store.",
  
  // Payment related
  payment_proof: "Hello! I've completed the payment for my order. Here's the transfer proof:",
  payment_help: "Hello! I need help with payment for my order.",
  payment_method: "Hello! I have questions about payment methods.",
  
  // Order related
  order_status: "Hello! I'd like to check my order status.",
  order_problem: "Hello! I'm having issues with my order.",
  download_problem: "Hello! I'm having trouble downloading my ebook.",
  
  // Product questions
  product_question: "Hello! I have questions about your ebooks.",
  product_availability: "Hello! Is this ebook available?",
  
  // Account related
  account_help: "Hello! I need help with my account.",
  forgot_password: "Hello! I need help resetting my password.",
  
  // Business inquiries
  bulk_purchase: "Hello! I'm interested in bulk purchase of ebooks.",
  partnership: "Hello! I'm interested in partnership opportunities."
}

export interface WhatsAppOptions {
  message?: string
  orderId?: string
  productTitle?: string
  amount?: string
  paymentMethod?: string
}

// Generate WhatsApp URL with custom message
export function generateWhatsAppUrl(type: keyof typeof WHATSAPP_MESSAGES, options?: WhatsAppOptions): string {
  let message = WHATSAPP_MESSAGES[type]
  
  // Add dynamic content based on options
  if (options) {
    if (options.orderId) {
      message += `\n\nOrder ID: ${options.orderId}`
    }
    
    if (options.productTitle) {
      message += `\n\nProduct: ${options.productTitle}`
    }
    
    if (options.amount) {
      message += `\n\nAmount: ${options.amount}`
    }
    
    if (options.paymentMethod) {
      message += `\n\nPayment Method: ${options.paymentMethod}`
    }
    
    if (options.message) {
      message += `\n\n${options.message}`
    }
  }
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message)
  
  return `${WHATSAPP_CONFIG.baseUrl}${WHATSAPP_CONFIG.number}?text=${encodedMessage}`
}

// Generate custom WhatsApp URL with completely custom message
export function generateCustomWhatsAppUrl(customMessage: string): string {
  const encodedMessage = encodeURIComponent(customMessage)
  return `${WHATSAPP_CONFIG.baseUrl}${WHATSAPP_CONFIG.number}?text=${encodedMessage}`
}

// Open WhatsApp in new window/tab
export function openWhatsApp(type: keyof typeof WHATSAPP_MESSAGES, options?: WhatsAppOptions): void {
  const url = generateWhatsAppUrl(type, options)
  window.open(url, '_blank', 'noopener,noreferrer')
}

// Open WhatsApp with custom message
export function openCustomWhatsApp(customMessage: string): void {
  const url = generateCustomWhatsAppUrl(customMessage)
  window.open(url, '_blank', 'noopener,noreferrer')
}

// Format phone number for display
export function formatWhatsAppNumber(): string {
  return `+${WHATSAPP_CONFIG.number}`
}