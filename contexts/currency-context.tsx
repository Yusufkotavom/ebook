"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { formatPrice, getCurrency, type Currency } from "@/lib/currency"

interface CurrencyContextType {
  currency: Currency
  currencyCode: string
  formatPrice: (amount: number | string) => string
  setCurrency: (currencyCode: string) => void
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ 
  children, 
  initialCurrency = "USD" 
}: { 
  children: React.ReactNode
  initialCurrency?: string 
}) {
  const [currencyCode, setCurrencyCode] = useState(initialCurrency)
  const [isLoading, setIsLoading] = useState(true)

  // Load currency from database on mount
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const supabase = createClient()
        const { data: settings } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", "currency")
          .single()

        if (settings?.value) {
          setCurrencyCode(settings.value)
        }
      } catch (error) {
        console.error("Failed to load currency settings:", error)
        // Keep default currency if loading fails
      } finally {
        setIsLoading(false)
      }
    }

    loadCurrency()
  }, [])

  const currency = getCurrency(currencyCode)

  const formatPriceWithCurrency = (amount: number | string) => {
    return formatPrice(amount, currencyCode)
  }

  const setCurrency = async (newCurrencyCode: string) => {
    setCurrencyCode(newCurrencyCode)
    
    // Optionally persist to database (for user preferences)
    // This would be useful if you want to remember user's currency choice
    try {
      const supabase = createClient()
      await supabase
        .from("app_settings")
        .upsert([
          {
            key: "currency",
            value: newCurrencyCode,
            updated_at: new Date().toISOString(),
          },
        ])
    } catch (error) {
      console.error("Failed to save currency preference:", error)
    }
  }

  const value: CurrencyContextType = {
    currency,
    currencyCode,
    formatPrice: formatPriceWithCurrency,
    setCurrency,
    isLoading,
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}

// Hook for components that need currency without the provider
export function useCurrencyFromServer(serverCurrency?: string) {
  const [currencyCode, setCurrencyCode] = useState(serverCurrency || "USD")
  
  useEffect(() => {
    if (serverCurrency) {
      setCurrencyCode(serverCurrency)
    }
  }, [serverCurrency])

  const currency = getCurrency(currencyCode)
  
  const formatPriceWithCurrency = (amount: number | string) => {
    return formatPrice(amount, currencyCode)
  }

  return {
    currency,
    currencyCode,
    formatPrice: formatPriceWithCurrency,
  }
}