"use client"

import React from 'react'
import { Spinner } from '@/components/ui/spinner'

interface PageLoadingProps {
  title?: string
  subtitle?: string
  variant?: 'default' | 'admin' | 'dashboard'
}

export function PageLoading({ 
  title = "Loading...", 
  subtitle,
  variant = 'default' 
}: PageLoadingProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'admin':
        return {
          background: 'bg-gradient-to-br from-indigo-50 to-blue-50',
          spinner: 'text-indigo-600',
          title: 'text-indigo-900',
          subtitle: 'text-indigo-600'
        }
      case 'dashboard':
        return {
          background: 'bg-gradient-to-br from-green-50 to-emerald-50',
          spinner: 'text-green-600',
          title: 'text-green-900',
          subtitle: 'text-green-600'
        }
      default:
        return {
          background: 'bg-gradient-to-br from-gray-50 to-gray-100',
          spinner: 'text-gray-600',
          title: 'text-gray-900',
          subtitle: 'text-gray-600'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${styles.background}`}>
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <div className="mb-6 relative">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <Spinner size="lg" className={styles.spinner} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                {variant === 'admin' ? (
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                ) : variant === 'dashboard' ? (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className={`text-xl font-semibold ${styles.title}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`text-sm ${styles.subtitle}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Loading Dots Animation */}
        <div className="flex justify-center mt-4 space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 ${styles.spinner.replace('text-', 'bg-')} rounded-full animate-pulse`}
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Specific loading components for different contexts
export function AdminPageLoading({ title, subtitle }: Omit<PageLoadingProps, 'variant'>) {
  return (
    <PageLoading 
      variant="admin" 
      title={title || "Loading Admin Panel..."} 
      subtitle={subtitle || "Please wait while we prepare your dashboard"}
    />
  )
}

export function DashboardPageLoading({ title, subtitle }: Omit<PageLoadingProps, 'variant'>) {
  return (
    <PageLoading 
      variant="dashboard" 
      title={title || "Loading Dashboard..."} 
      subtitle={subtitle || "Preparing your personal dashboard"}
    />
  )
}

// Inline loading component for page sections
export function SectionLoading({ 
  title = "Loading...", 
  className = "",
  size = "default"
}: {
  title?: string
  className?: string
  size?: "sm" | "default" | "lg"
}) {
  const sizeClasses = {
    sm: "py-4",
    default: "py-8", 
    lg: "py-12"
  }

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]} ${className}`}>
      <Spinner size={size === "sm" ? "default" : size === "lg" ? "lg" : "default"} className="mb-3" />
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  )
}