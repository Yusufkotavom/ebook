"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, Send, Package, ExternalLink, CheckCircle } from "lucide-react"
import { useState } from "react"

interface Order {
  id: string
  total_amount: string
  status: string
  user_id: string | null
  guest_email: string | null
  guest_name: string | null
  guest_whatsapp: string | null
  profiles: { 
    email: string
    full_name: string | null
    whatsapp_number: string | null
  } | null
  order_items: Array<{
    quantity: number
    price: string
    products: { title: string; author: string } | null
  }>
}

interface NotificationDialogProps {
  order: Order
  onClose: () => void
}

export function NotificationDialog({ order, onClose }: NotificationDialogProps) {
  const customerEmail = order.profiles?.email || order.guest_email || ""
  const customerName = order.profiles?.full_name || order.guest_name || "Customer"
  const customerWhatsApp = order.profiles?.whatsapp_number || order.guest_whatsapp || ""
  
  // Generate product list for notifications
  const productList = order.order_items.map((item, index) => 
    `${index + 1}. ${item.products?.title || 'Unknown Product'} by ${item.products?.author || 'Unknown Author'} (Qty: ${item.quantity})`
  ).join('\n')

  const [emailMessage, setEmailMessage] = useState(
    `Dear ${customerName},

Thank you for your order #${order.id.slice(0, 8)}!

Your purchased ebooks:
${productList}

${order.status === 'paid' 
  ? `Your payment has been confirmed! You can download your ebooks using the links below:

Download Links:
${order.order_items.map((item, index) => 
  `${index + 1}. ${item.products?.title || 'Product'}: [Download will be provided after payment confirmation]`
).join('\n')}

If you have any issues accessing your downloads, please contact our support team.`
  : `Payment Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}

Once your payment is confirmed, you'll receive download links for all your ebooks.`}

Best regards,
Ebook Store Team

Need help? Contact us via WhatsApp: +6285799520350`
  )

  const [whatsappMessage, setWhatsappMessage] = useState(
    `Hi ${customerName}! 📚

Your ebook order #${order.id.slice(0, 8)}:

${productList.split('\n').join('\n')}

${order.status === 'paid' 
  ? `✅ Payment confirmed! Check your email for download links.`
  : `📋 Status: ${order.status}. Download links will be sent once payment is confirmed.`}

Questions? Reply to this message!

- Ebook Store Team`
  )

  const [customWhatsappNumber, setCustomWhatsappNumber] = useState(customerWhatsApp)
  const [sending, setSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [whatsappSent, setWhatsappSent] = useState(false)

  const sendEmailNotification = async () => {
    if (!customerEmail) {
      alert("No email address available for this customer")
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/notifications/manual-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          email: customerEmail,
          customerName: customerName,
          message: emailMessage,
          products: order.order_items,
          orderStatus: order.status
        }),
      })

      if (!response.ok) throw new Error("Failed to send email")
      
      setEmailSent(true)
      alert("Email notification sent successfully!")
    } catch (error) {
      console.error("Email notification error:", error)
      alert("Failed to send email notification")
    } finally {
      setSending(false)
    }
  }

  const sendWhatsAppNotification = async () => {
    const targetNumber = customWhatsappNumber || customerWhatsApp
    if (!targetNumber) {
      alert("No WhatsApp number available. Please enter a number.")
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/notifications/manual-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          whatsappNumber: targetNumber,
          customerName: customerName,
          message: whatsappMessage,
          products: order.order_items,
          orderStatus: order.status
        }),
      })

      if (!response.ok) throw new Error("Failed to send WhatsApp message")
      
      setWhatsappSent(true)
      alert("WhatsApp notification sent successfully!")
    } catch (error) {
      console.error("WhatsApp notification error:", error)
      alert("Failed to send WhatsApp notification")
    } finally {
      setSending(false)
    }
  }

  const openWhatsAppDirect = () => {
    const targetNumber = customWhatsappNumber || customerWhatsApp
    if (!targetNumber) {
      alert("No WhatsApp number available. Please enter a number.")
      return
    }
    
    const encodedMessage = encodeURIComponent(whatsappMessage)
    const whatsappUrl = `https://wa.me/${targetNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
    setWhatsappSent(true)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Manual Notification
          </DialogTitle>
          <DialogDescription>
            Send custom notifications to customer about their order
          </DialogDescription>
        </DialogHeader>

        {/* Customer & Order Info */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order #{order.id.slice(0, 8)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Customer</Label>
                <div className="mt-1">
                  <div className="font-medium">{customerName}</div>
                  <div className="text-sm text-gray-600">{customerEmail || "No email"}</div>
                  {customerWhatsApp && (
                    <div className="text-sm text-gray-500">WA: {customerWhatsApp}</div>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Order Status</Label>
                <div className="mt-1">
                  <Badge 
                    variant={order.status === 'paid' ? 'default' : 
                             order.status === 'pending' ? 'secondary' : 'destructive'}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Products ({order.order_items.length})</Label>
              <div className="mt-1 space-y-1">
                {order.order_items.map((item, index) => (
                  <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                    <span className="font-medium">{item.products?.title || 'Unknown Product'}</span>
                    <span className="text-gray-600"> by {item.products?.author || 'Unknown Author'}</span>
                    <span className="text-gray-500"> (Qty: {item.quantity})</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Notification
              {emailSent && <CheckCircle className="h-3 w-3 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              WhatsApp Notification
              {whatsappSent && <CheckCircle className="h-3 w-3 text-green-600" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <div>
              <Label htmlFor="email-to">Send to Email</Label>
              <Input
                id="email-to"
                type="email"
                value={customerEmail}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="email-message">Email Message</Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={12}
                className="resize-none"
              />
            </div>
            <Button 
              onClick={sendEmailNotification} 
              disabled={sending || !customerEmail || emailSent}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              {emailSent ? "Email Sent!" : sending ? "Sending..." : "Send Email"}
            </Button>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <div>
              <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
              <Input
                id="whatsapp-number"
                type="tel"
                value={customWhatsappNumber}
                onChange={(e) => setCustomWhatsappNumber(e.target.value)}
                placeholder="Enter WhatsApp number (e.g., 6281234567890)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., 62 for Indonesia)
              </p>
            </div>
            <div>
              <Label htmlFor="whatsapp-message">WhatsApp Message</Label>
              <Textarea
                id="whatsapp-message"
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                rows={10}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button 
                onClick={sendWhatsAppNotification} 
                disabled={sending || !customWhatsappNumber}
                variant="outline"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Sending..." : "Send via API"}
              </Button>
              <Button 
                onClick={openWhatsAppDirect} 
                disabled={!customWhatsappNumber}
                className="bg-green-600 hover:bg-green-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open WhatsApp
              </Button>
            </div>
            {whatsappSent && (
              <div className="text-sm text-green-600 text-center">
                ✅ WhatsApp notification sent successfully!
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
