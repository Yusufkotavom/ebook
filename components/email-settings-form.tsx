"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Settings, Send, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"

interface EmailSettings {
  email_provider: string
  email_from_address: string
  email_from_name: string
  email_reply_to: string
  brevo_api_key: string
  smtp_host: string
  smtp_port: string
  smtp_user: string
  smtp_pass: string
  email_notifications_enabled: string
}

export function EmailSettingsForm() {
  const [settings, setSettings] = useState<EmailSettings>({
    email_provider: 'brevo_api',
    email_from_address: '',
    email_from_name: '',
    email_reply_to: '',
    brevo_api_key: '',
    smtp_host: 'smtp-relay.brevo.com',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    email_notifications_enabled: 'true',
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'email_provider', 'email_from_address', 'email_from_name', 'email_reply_to',
          'brevo_api_key', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass',
          'email_notifications_enabled'
        ])

      if (error) throw error

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.setting_key] = item.setting_value
          return acc
        }, {} as Record<string, string>)

        setSettings(prev => ({
          ...prev,
          ...settingsMap
        }))
      }
    } catch (error) {
      console.error('Error loading email settings:', error)
      toast.error('Failed to load email settings')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    const loadingToast = toast.loading('Saving email settings...')

    try {
      const supabase = createClient()
      
      // Prepare updates
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString()
      }))

      // Update each setting
      for (const update of updates) {
        const { error } = await supabase
          .from('app_settings')
          .upsert(update, { onConflict: 'setting_key' })

        if (error) throw error
      }

      toast.success(
        '📧 Email settings saved successfully!',
        { 
          duration: 3000,
          id: loadingToast 
        }
      )
    } catch (error) {
      console.error('Error saving email settings:', error)
      toast.error(
        `Failed to save email settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { 
          duration: 5000,
          id: loadingToast 
        }
      )
    } finally {
      setIsSaving(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address')
      return
    }

    setIsTestingEmail(true)
    const loadingToast = toast.loading(`Sending test email to ${testEmail}...`)

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          toEmail: testEmail,
          settings: settings
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send test email')
      }

      toast.success(
        `✅ Test email sent successfully to ${testEmail}!`,
        { 
          duration: 4000,
          id: loadingToast 
        }
      )
    } catch (error) {
      console.error('Error sending test email:', error)
      toast.error(
        `Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { 
          duration: 5000,
          id: loadingToast 
        }
      )
    } finally {
      setIsTestingEmail(false)
    }
  }

  const handleChange = (key: keyof EmailSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2">Loading email settings...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* General Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            General Email Settings
          </CardTitle>
          <CardDescription>
            Configure your email service provider and basic settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email_provider">Email Provider</Label>
              <Select
                value={settings.email_provider}
                onValueChange={(value) => handleChange('email_provider', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brevo_api">Brevo API (Recommended)</SelectItem>
                  <SelectItem value="brevo_smtp">Brevo SMTP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="email_notifications_enabled"
                checked={settings.email_notifications_enabled === 'true'}
                onCheckedChange={(checked) => 
                  handleChange('email_notifications_enabled', checked.toString())
                }
              />
              <Label htmlFor="email_notifications_enabled">
                Enable Email Notifications
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email_from_address">From Email Address</Label>
              <Input
                id="email_from_address"
                type="email"
                value={settings.email_from_address}
                onChange={(e) => handleChange('email_from_address', e.target.value)}
                placeholder="noreply@yourdomain.com"
              />
            </div>

            <div>
              <Label htmlFor="email_from_name">From Name</Label>
              <Input
                id="email_from_name"
                value={settings.email_from_name}
                onChange={(e) => handleChange('email_from_name', e.target.value)}
                placeholder="Ebook Store"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email_reply_to">Reply-To Address</Label>
            <Input
              id="email_reply_to"
              type="email"
              value={settings.email_reply_to}
              onChange={(e) => handleChange('email_reply_to', e.target.value)}
              placeholder="support@yourdomain.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Brevo API Settings */}
      {settings.email_provider === 'brevo_api' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Brevo API Configuration
            </CardTitle>
            <CardDescription>
              Configure Brevo API for reliable email delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="brevo_api_key">Brevo API Key</Label>
              <div className="relative">
                <Input
                  id="brevo_api_key"
                  type={showApiKey ? "text" : "password"}
                  value={settings.brevo_api_key}
                  onChange={(e) => handleChange('brevo_api_key', e.target.value)}
                  placeholder="xkeysib-..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Get your API key from Brevo dashboard → API Keys
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SMTP Settings */}
      {settings.email_provider === 'brevo_smtp' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              SMTP Configuration
            </CardTitle>
            <CardDescription>
              Configure SMTP settings for Brevo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp_host">SMTP Host</Label>
                <Input
                  id="smtp_host"
                  value={settings.smtp_host}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                  placeholder="smtp-relay.brevo.com"
                />
              </div>

              <div>
                <Label htmlFor="smtp_port">SMTP Port</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) => handleChange('smtp_port', e.target.value)}
                  placeholder="587"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp_user">SMTP Username</Label>
                <Input
                  id="smtp_user"
                  value={settings.smtp_user}
                  onChange={(e) => handleChange('smtp_user', e.target.value)}
                  placeholder="your-smtp-login"
                />
              </div>

              <div>
                <Label htmlFor="smtp_pass">SMTP Password</Label>
                <div className="relative">
                  <Input
                    id="smtp_pass"
                    type={showPassword ? "text" : "password"}
                    value={settings.smtp_pass}
                    onChange={(e) => handleChange('smtp_pass', e.target.value)}
                    placeholder="your-master-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Email Configuration
          </CardTitle>
          <CardDescription>
            Send a test email to verify your configuration is working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={sendTestEmail} 
              disabled={isTestingEmail || !testEmail}
            >
              {isTestingEmail ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={saveSettings} 
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Save Email Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}