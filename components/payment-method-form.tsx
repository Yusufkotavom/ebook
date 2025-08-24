"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { CreditCard, Wallet } from "lucide-react"

interface PaymentMethod {
  id?: string
  type: string
  name: string
  account_number: string
  account_name: string
  instructions: string
  is_active: boolean
  display_order: number
}

interface PaymentMethodFormProps {
  paymentMethod?: PaymentMethod
}

const BANK_OPTIONS = [
  "Bank BCA", "Bank Mandiri", "Bank BNI", "Bank BRI", "Bank CIMB Niaga",
  "Bank Danamon", "Bank Permata", "Bank BTPN", "Bank Mega", "Bank OCBC NISP",
  "Bank Maybank", "Bank Panin", "Bank Bukopin", "Bank Sinarmas", "Bank Capital"
]

const EWALLET_OPTIONS = [
  "OVO", "Dana", "GoPay", "LinkAja", "ShopeePay", "QRIS"
]

export function PaymentMethodForm({ paymentMethod }: PaymentMethodFormProps) {
  const [formData, setFormData] = useState({
    type: paymentMethod?.type || "",
    name: paymentMethod?.name || "",
    account_number: paymentMethod?.account_number || "",
    account_name: paymentMethod?.account_name || "",
    instructions: paymentMethod?.instructions || "",
    is_active: paymentMethod?.is_active ?? true,
    display_order: paymentMethod?.display_order || 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const url = paymentMethod?.id 
        ? `/api/payment-methods/${paymentMethod.id}`
        : "/api/payment-methods"
      
      const method = paymentMethod?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save payment method")
      }

      router.push("/admin/settings/payment-methods")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getPlaceholder = () => {
    if (formData.type === "bank") {
      return {
        account_number: "1234567890",
        account_name: "Nama Pemilik Rekening",
        instructions: "Transfer ke rekening di atas, lalu upload bukti transfer"
      }
    } else {
      return {
        account_number: "081234567890",
        account_name: "Nama Pemilik E-Wallet",
        instructions: "Transfer ke nomor di atas, lalu screenshot bukti transfer"
      }
    }
  }

  const placeholder = getPlaceholder()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="type">Payment Type *</Label>
        <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Bank Transfer
              </div>
            </SelectItem>
            <SelectItem value="ewallet">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                E-Wallet
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type && (
        <div>
          <Label htmlFor="name">{formData.type === "bank" ? "Bank Name" : "E-Wallet Provider"} *</Label>
          <Select value={formData.name} onValueChange={(value) => handleChange("name", value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={`Select ${formData.type === "bank" ? "bank" : "e-wallet provider"}`} />
            </SelectTrigger>
            <SelectContent>
              {(formData.type === "bank" ? BANK_OPTIONS : EWALLET_OPTIONS).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="account_number">
          {formData.type === "bank" ? "Account Number" : "Phone Number"} *
        </Label>
        <Input
          id="account_number"
          required
          value={formData.account_number}
          onChange={(e) => handleChange("account_number", e.target.value)}
          placeholder={placeholder.account_number}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="account_name">
          {formData.type === "bank" ? "Account Holder Name" : "Account Name"} *
        </Label>
        <Input
          id="account_name"
          required
          value={formData.account_name}
          onChange={(e) => handleChange("account_name", e.target.value)}
          placeholder={placeholder.account_name}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="instructions">Payment Instructions</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) => handleChange("instructions", e.target.value)}
          placeholder={placeholder.instructions}
          rows={3}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="display_order">Display Order</Label>
        <Input
          id="display_order"
          type="number"
          value={formData.display_order}
          onChange={(e) => handleChange("display_order", parseInt(e.target.value) || 0)}
          placeholder="0"
          className="mt-2"
        />
        <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => handleChange("is_active", checked)}
        />
        <Label htmlFor="is_active">Active (visible to customers)</Label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || !formData.type || !formData.name}>
          {isLoading ? "Saving..." : paymentMethod ? "Update Payment Method" : "Add Payment Method"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push("/admin/settings/payment-methods")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}