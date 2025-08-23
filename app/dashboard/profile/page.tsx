import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

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
            <form className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={user.email || ""} disabled />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
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

              <div className="pt-4">
                <Button type="submit" disabled>
                  Save Changes
                </Button>
                <p className="text-xs text-gray-500 mt-2">Profile editing will be available in a future update.</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
