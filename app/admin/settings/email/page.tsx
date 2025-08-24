import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import { EmailSettingsForm } from "@/components/email-settings-form"

export default function EmailSettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/settings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="h-8 w-8" />
          Email Configuration
        </h1>
        <p className="text-gray-600">
          Configure Brevo email service for transactional emails
        </p>
      </div>

      <EmailSettingsForm />
    </div>
  )
}