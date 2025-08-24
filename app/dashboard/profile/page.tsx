"use client"

import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  full_name?: string
  whatsapp_number?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [fullName, setFullName] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createClient()

      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push("/auth/login")
        return
      }

      setUser(currentUser)

      // Fetch user profile
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, whatsapp_number")
        .eq("id", currentUser.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
      } else if (userProfile) {
        setProfile(userProfile)
        setFullName(userProfile.full_name || "")
        setWhatsappNumber(userProfile.whatsapp_number || "")
      }

      setIsInitialLoading(false)
    }

    loadUserData()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          full_name: fullName.trim(),
          whatsapp_number: whatsappNumber.trim()
        })

      if (updateError) throw updateError

      setSuccess("Profile updated successfully!")
      
      // Update local state
      setProfile({
        full_name: fullName.trim(),
        whatsapp_number: whatsappNumber.trim()
      })

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="max-w-2xl">
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal details and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={user.email || ""} disabled />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input 
                  id="whatsappNumber" 
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+62812345678"
                />
                <p className="text-xs text-gray-500 mt-1">For order notifications and support</p>
              </div>

              <div>
                <Label htmlFor="created">Member Since</Label>
                <Input id="created" value={new Date(user.created_at).toLocaleDateString()} disabled />
              </div>

              <div>
                <Label htmlFor="last-sign-in">Last Sign In</Label>
                <Input
                  id="last-sign-in"
                  value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
                  disabled
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}

              <div className="pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
