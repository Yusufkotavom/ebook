import { createClient } from "@/lib/server"
import { formatPrice } from "@/lib/currency"

export async function getCurrencyFromServer(): Promise<string> {
  try {
    const supabase = await createClient()
    const { data: settings } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "currency")
      .single()

    return settings?.value || "USD"
  } catch (error) {
    console.error("Failed to load currency from server:", error)
    return "USD"
  }
}

export async function formatPriceServer(amount: number | string): Promise<string> {
  const currency = await getCurrencyFromServer()
  return formatPrice(amount, currency)
}