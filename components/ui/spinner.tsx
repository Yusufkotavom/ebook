import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  color?: "primary" | "white" | "gray" | "green" | "blue"
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
  xl: "h-12 w-12"
}

const colorClasses = {
  primary: "border-primary",
  white: "border-white",
  gray: "border-gray-600",
  green: "border-green-600",
  blue: "border-blue-600"
}

export function Spinner({ size = "md", className, color = "primary" }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-t-transparent",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  )
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  className?: string
  color?: "primary" | "white" | "gray" | "green" | "blue"
}

export function LoadingSpinner({ size = "md", text, className, color = "primary" }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Spinner size={size} color={color} />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  )
}

interface PageLoaderProps {
  text?: string
  className?: string
}

export function PageLoader({ text = "Loading...", className }: PageLoaderProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-background", className)}>
      <div className="text-center space-y-4">
        <Spinner size="xl" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">{text}</h3>
          <p className="text-sm text-gray-500">Please wait a moment</p>
        </div>
      </div>
    </div>
  )
}

interface CardLoaderProps {
  className?: string
  rows?: number
}

export function CardLoader({ className, rows = 3 }: CardLoaderProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="space-y-4">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
    </div>
  )
}

interface ButtonSpinnerProps {
  className?: string
}

export function ButtonSpinner({ className }: ButtonSpinnerProps) {
  return (
    <Spinner 
      size="sm" 
      color="white" 
      className={cn("mr-2", className)} 
    />
  )
}