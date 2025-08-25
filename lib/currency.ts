export interface Currency {
  code: string
  name: string
  symbol: string
  symbolPosition: 'before' | 'after'
  decimalPlaces: number
  thousandsSeparator: string
  decimalSeparator: string
}

export const CURRENCIES: Record<string, Currency> = {
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  GBP: {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  JPY: {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    symbolPosition: "before",
    decimalPlaces: 0,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  CNY: {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  INR: {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  IDR: {
    code: "IDR",
    name: "Indonesian Rupiah",
    symbol: "Rp",
    symbolPosition: "before",
    decimalPlaces: 0,
    thousandsSeparator: ".",
    decimalSeparator: ",",
  },
  KRW: {
    code: "KRW",
    name: "South Korean Won",
    symbol: "₩",
    symbolPosition: "before",
    decimalPlaces: 0,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  SGD: {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  MYR: {
    code: "MYR",
    name: "Malaysian Ringgit",
    symbol: "RM",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  THB: {
    code: "THB",
    name: "Thai Baht",
    symbol: "฿",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  VND: {
    code: "VND",
    name: "Vietnamese Dong",
    symbol: "₫",
    symbolPosition: "after",
    decimalPlaces: 0,
    thousandsSeparator: ".",
    decimalSeparator: ",",
  },
  AUD: {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  CAD: {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  CHF: {
    code: "CHF",
    name: "Swiss Franc",
    symbol: "CHF",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: "'",
    decimalSeparator: ".",
  },
  SEK: {
    code: "SEK",
    name: "Swedish Krona",
    symbol: "kr",
    symbolPosition: "after",
    decimalPlaces: 2,
    thousandsSeparator: " ",
    decimalSeparator: ",",
  },
  NOK: {
    code: "NOK",
    name: "Norwegian Krone",
    symbol: "kr",
    symbolPosition: "after",
    decimalPlaces: 2,
    thousandsSeparator: " ",
    decimalSeparator: ",",
  },
  DKK: {
    code: "DKK",
    name: "Danish Krone",
    symbol: "kr",
    symbolPosition: "after",
    decimalPlaces: 2,
    thousandsSeparator: ".",
    decimalSeparator: ",",
  },
  PLN: {
    code: "PLN",
    name: "Polish Zloty",
    symbol: "zł",
    symbolPosition: "after",
    decimalPlaces: 2,
    thousandsSeparator: " ",
    decimalSeparator: ",",
  },
  RUB: {
    code: "RUB",
    name: "Russian Ruble",
    symbol: "₽",
    symbolPosition: "after",
    decimalPlaces: 2,
    thousandsSeparator: " ",
    decimalSeparator: ",",
  },
  TRY: {
    code: "TRY",
    name: "Turkish Lira",
    symbol: "₺",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ".",
    decimalSeparator: ",",
  },
  BRL: {
    code: "BRL",
    name: "Brazilian Real",
    symbol: "R$",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ".",
    decimalSeparator: ",",
  },
  MXN: {
    code: "MXN",
    name: "Mexican Peso",
    symbol: "$",
    symbolPosition: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
}

export function formatPrice(amount: number | string, currencyCode: string = "IDR"): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount

  if (isNaN(numericAmount)) {
    return `${currency.symbol}0${currency.decimalSeparator}${currency.decimalPlaces > 0 ? "0".repeat(currency.decimalPlaces) : ""}`
  }

  // Format the number with appropriate decimal places
  const fixedAmount = numericAmount.toFixed(currency.decimalPlaces)
  const [integerPart, decimalPart] = fixedAmount.split(".")

  // Add thousands separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator)

  // Construct the final formatted string
  let formattedAmount = formattedInteger
  if (currency.decimalPlaces > 0 && decimalPart) {
    formattedAmount += currency.decimalSeparator + decimalPart
  }

  // Apply symbol position
  if (currency.symbolPosition === "before") {
    return `${currency.symbol}${formattedAmount}`
  } else {
    return `${formattedAmount} ${currency.symbol}`
  }
}

export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCIES[currencyCode]?.symbol || "$"
}

export function getCurrency(currencyCode: string): Currency {
  return CURRENCIES[currencyCode] || CURRENCIES.USD
}

// Price range utilities for different currencies
export function getPriceRanges(currencyCode: string): Array<{ value: string; label: string; min?: number; max?: number }> {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD
  
  // Adjust ranges based on currency (for currencies with different value scales)
  let ranges: Array<{ value: string; label: string; min?: number; max?: number }>
  
  switch (currencyCode) {
    case "JPY":
    case "KRW":
    case "VND":
    case "IDR":
      // High-value currencies
      ranges = [
        { value: "all", label: "All Prices" },
        { value: "0-2000", label: `${currency.symbol}0 - ${currency.symbol}2,000`, min: 0, max: 2000 },
        { value: "2000-5000", label: `${currency.symbol}2,000 - ${currency.symbol}5,000`, min: 2000, max: 5000 },
        { value: "5000-10000", label: `${currency.symbol}5,000 - ${currency.symbol}10,000`, min: 5000, max: 10000 },
        { value: "10000+", label: `${currency.symbol}10,000+`, min: 10000 },
      ]
      break
    default:
      // Standard currencies
      ranges = [
        { value: "all", label: "All Prices" },
        { value: "0-20", label: `${currency.symbol}0 - ${currency.symbol}20`, min: 0, max: 20 },
        { value: "20-40", label: `${currency.symbol}20 - ${currency.symbol}40`, min: 20, max: 40 },
        { value: "40-60", label: `${currency.symbol}40 - ${currency.symbol}60`, min: 40, max: 60 },
        { value: "60+", label: `${currency.symbol}60+`, min: 60 },
      ]
  }
  
  return ranges
}