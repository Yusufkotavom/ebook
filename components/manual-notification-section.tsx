"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Mail, MessageSquare } from "lucide-react"

export function ManualNotificationSection() {
  const [formData, setFormData] = useState({
    type: "",
    recipient: "",
    message: "",
    subject: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("notifications").insert([
        {
          type: formData.type,
          recipient: formData.recipient,
          message: formData.message,
          subject: formData.subject,
          sent_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      setSuccess("Notification sent successfully!")
      setFormData({
        type: "",
        recipient: "",
        message: "",
        subject: "",
      })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Manual Notification
        </CardTitle>
        <CardDescription>Send custom notifications to customers via email or WhatsApp</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Notification Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recipient">Recipient *</Label>
              <Input
                id="recipient"
                required
                value={formData.recipient}
                onChange={(e) => handleChange("recipient", e.target.value)}
                placeholder="email@example.com or +1234567890"
              />
            </div>
          </div>

          {formData.type === "email" && (
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                required
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="Email subject"
              />
            </div>
          )}

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              required
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Enter your message..."
              rows={4}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <Button type="submit" disabled={isLoading || !formData.type || !formData.recipient || !formData.message}>
            {isLoading ? "Sending..." : "Send Notification"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}