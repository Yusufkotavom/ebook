"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, MessageSquare, Send } from "lucide-react"
import { useState } from "react"

interface Order {
  id: string
  total_amount: string
  status: string
  profiles: { email: string } | null
  order_items: Array<{
    products: { title: string; author: string } | null
  }>
}

interface NotificationDialogProps {
  order: Order
  onClose: () => void
}

export function NotificationDialog({ order, onClose }: NotificationDialogProps) {
  const [emailMessage, setEmailMessage] = useState(
    `Hi there!\n\nRegarding your order #${order.id.slice(0, 8)}:\n\nWe wanted to update you on your recent purchase. Please let us know if you have any questions.\n\nBest regards,\nEbook Store Team`,
  )
  const [whatsappMessage, setWhatsappMessage] = useState(
    `Hi! Update on your ebook order #${order.id.slice(0, 8)} - please check your email for details. Thanks!`,
  )
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [sending, setSending] = useState(false)

  const sendEmailNotification = async () => {
    setSending(true)
    try {
      const response = await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          email: order.profiles?.email,
          message: emailMessage,
        }),
      })

      if (!response.ok) throw new Error("Failed to send email")

      alert("Email notification sent successfully!")
      onClose()
    } catch (error) {
      console.error("Failed to send email notification", error)
      alert("Failed to send email notification")
    } finally {
      setSending(false)
    }
  }

  const sendWhatsAppNotification = async () => {
    setSending(true)
    try {
      const response = await fetch("/api/notifications/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          phone: whatsappNumber,
          message: whatsappMessage,
        }),
      })

      if (!response.ok) throw new Error("Failed to send WhatsApp message")

      alert("WhatsApp notification sent successfully!")
      onClose()
    } catch (error) {
      console.error("Failed to send WhatsApp notification", error)
      alert("Failed to send WhatsApp notification")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
          <DialogDescription>Send manual notification for order #{order.id.slice(0, 8)}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <div>
              <Label htmlFor="email-recipient">Recipient</Label>
              <Input id="email-recipient" value={order.profiles?.email || ""} disabled className="bg-gray-50" />
            </div>
            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={8}
                placeholder="Enter your email message..."
              />
            </div>
            <Button onClick={sendEmailNotification} disabled={sending || !order.profiles?.email} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send Email"}
            </Button>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <div>
              <Label htmlFor="whatsapp-number">Phone Number</Label>
              <Input
                id="whatsapp-number"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp-message">Message</Label>
              <Textarea
                id="whatsapp-message"
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                rows={4}
                placeholder="Enter your WhatsApp message..."
              />
            </div>
            <Button onClick={sendWhatsAppNotification} disabled={sending || !whatsappNumber} className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send WhatsApp"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
