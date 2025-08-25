"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Phone, HelpCircle } from "lucide-react"
import { openWhatsApp, formatWhatsAppNumber, type WhatsAppOptions, WHATSAPP_MESSAGES } from "@/lib/whatsapp"
import { cn } from "@/lib/utils"

interface WhatsAppButtonProps {
  type: keyof typeof WHATSAPP_MESSAGES
  options?: WhatsAppOptions
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
  icon?: boolean
}

export function WhatsAppButton({ 
  type, 
  options, 
  variant = "default", 
  size = "default", 
  className, 
  children,
  icon = true 
}: WhatsAppButtonProps) {
  const handleClick = () => {
    openWhatsApp(type, options)
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={cn("bg-green-600 hover:bg-green-700 text-white", className)}
    >
      {icon && <MessageCircle className="mr-2 h-4 w-4" />}
      {children || "Contact WhatsApp"}
    </Button>
  )
}

interface WhatsAppFloatingButtonProps {
  type?: keyof typeof WHATSAPP_MESSAGES
  options?: WhatsAppOptions
  className?: string
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
}

export function WhatsAppFloatingButton({ 
  type = "general", 
  options, 
  className, 
  position = "bottom-right" 
}: WhatsAppFloatingButtonProps) {
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6", 
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6"
  }

  const handleClick = () => {
    openWhatsApp(type, options)
  }

  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      <Button
        onClick={handleClick}
        size="lg"
        className="rounded-full h-14 w-14 bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    </div>
  )
}

interface WhatsAppCardProps {
  title?: string
  description?: string
  type: keyof typeof WHATSAPP_MESSAGES
  options?: WhatsAppOptions
  className?: string
  buttonText?: string
  showPhone?: boolean
}

export function WhatsAppCard({ 
  title = "Need Help?", 
  description = "Contact us via WhatsApp for quick assistance", 
  type, 
  options, 
  className,
  buttonText = "Chat on WhatsApp",
  showPhone = true 
}: WhatsAppCardProps) {
  const handleClick = () => {
    openWhatsApp(type, options)
  }

  return (
    <Card className={cn("border-green-200 bg-green-50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded-full">
            <MessageCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-lg text-green-800">{title}</CardTitle>
            <CardDescription className="text-green-700">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showPhone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">{formatWhatsAppNumber()}</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              Online
            </Badge>
          </div>
        )}
        <Button
          onClick={handleClick}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Send className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  )
}

interface WhatsAppPaymentSupportProps {
  orderId?: string
  amount?: string
  paymentMethod?: string
  className?: string
}

export function WhatsAppPaymentSupport({ 
  orderId, 
  amount, 
  paymentMethod, 
  className 
}: WhatsAppPaymentSupportProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <WhatsAppCard
        title="Send Payment Proof"
        description="Send your transfer receipt via WhatsApp"
        type="payment_proof"
        options={{ orderId, amount, paymentMethod }}
        buttonText="Send Transfer Proof"
        className="border-blue-200 bg-blue-50"
      />
      
      <div className="flex gap-2">
        <WhatsAppButton
          type="payment_help"
          options={{ orderId }}
          variant="outline"
          size="sm"
          className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Payment Help
        </WhatsAppButton>
        
        <WhatsAppButton
          type="order_status"
          options={{ orderId }}
          variant="outline"
          size="sm"
          className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
        >
          Order Status
        </WhatsAppButton>
      </div>
    </div>
  )
}

interface WhatsAppProductSupportProps {
  productTitle?: string
  className?: string
}

export function WhatsAppProductSupport({ product, className }: { product?: { title?: string; author?: string; price?: string }; className?: string }) {
  const handleClick = () => {
    const message = product 
      ? `Hi! I'm interested in "${product.title}" by ${product.author} (${product.price}). Is this available?`
      : "Hi! I have a question about one of your ebooks."
    
    const url = `https://wa.me/6285799520350?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className={cn("border-green-200 text-green-700 hover:bg-green-50", className)}
    >
      <MessageCircle className="h-4 w-4 sm:mr-1" />
      <span className="hidden sm:inline">Ask</span>
    </Button>
  )
}

interface WhatsAppOrderSupportProps {
  orderId?: string
  className?: string
}

export function WhatsAppOrderSupport({ orderId, className }: WhatsAppOrderSupportProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-2", className)}>
      <WhatsAppButton
        type="order_status"
        options={{ orderId }}
        variant="outline"
        size="sm"
        className="border-green-200 text-green-700 hover:bg-green-50"
      >
        Order Status
      </WhatsAppButton>
      
      <WhatsAppButton
        type="order_problem"
        options={{ orderId }}
        variant="outline"
        size="sm"
        className="border-green-200 text-green-700 hover:bg-green-50"
      >
        Report Issue
      </WhatsAppButton>
      
      <WhatsAppButton
        type="download_problem"
        options={{ orderId }}
        variant="outline"
        size="sm"
        className="border-green-200 text-green-700 hover:bg-green-50"
      >
        Download Help
      </WhatsAppButton>
    </div>
  )
}