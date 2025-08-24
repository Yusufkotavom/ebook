"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

import { CURRENCIES } from "@/lib/currency"

const CURRENCY_LIST = Object.values(CURRENCIES)

interface CurrencySettingsFormProps {
  currentCurrency: string
}

export function CurrencySettingsForm({ currentCurrency }: CurrencySettingsFormProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()

    try {
      // Upsert the currency setting
      const { error } = await supabase
        .from("app_settings")
        .upsert([
          {
            key: "currency",
            value: selectedCurrency,
            updated_at: new Date().toISOString(),
          },
        ])

      if (error) throw error

      setSuccess("Currency settings saved successfully!")
      
      // Refresh the page to update currency displays
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCurrencyInfo = CURRENCY_LIST.find(c => c.code === selectedCurrency)

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="currency">Currency</Label>
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {CURRENCY_LIST.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm w-8">{currency.symbol}</span>
                  <span>{currency.name} ({currency.code})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCurrencyInfo && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Preview</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Currency:</strong> {selectedCurrencyInfo.name}</p>
            <p><strong>Code:</strong> {selectedCurrencyInfo.code}</p>
            <p><strong>Symbol:</strong> {selectedCurrencyInfo.symbol}</p>
            <p><strong>Example:</strong> {selectedCurrencyInfo.symbol}29.99</p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <Button 
        onClick={handleSave} 
        disabled={isLoading || selectedCurrency === currentCurrency}
      >
        {isLoading ? "Saving..." : "Save Currency Settings"}
      </Button>
    </div>
  )
}