import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select(`
      id,
      type,
      recipient,
      message,
      sent_at,
      orders(id)
    `)
    .order("sent_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching notifications:", error)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Track all sent notifications and communications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>All email and WhatsApp notifications sent to customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications?.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {notification.type === "email" ? (
                    <Mail className="h-5 w-5 text-blue-600" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={notification.type === "email" ? "default" : "secondary"}>{notification.type}</Badge>
                    <span className="text-sm text-gray-500">to {notification.recipient}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(notification.sent_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {(!notifications || notifications.length === 0) && (
              <p className="text-gray-500 text-center py-8">No notifications sent yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
