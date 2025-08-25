"use client"

import React from 'react'
import { Spinner } from '@/components/ui/spinner'

interface CompilationLoadingProps {
  title?: string
  subtitle?: string
  variant?: 'default' | 'admin' | 'dashboard'
  compilationStep?: string
}

export function CompilationLoading({ 
  title = "Compiling...", 
  subtitle = "Building your application",
  variant = 'default',
  compilationStep
}: CompilationLoadingProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'admin':
        return {
          background: 'bg-gradient-to-br from-indigo-50 to-blue-50',
          spinner: 'text-indigo-600',
          title: 'text-indigo-900',
          subtitle: 'text-indigo-600',
          step: 'text-indigo-700',
          border: 'border-indigo-200'
        }
      case 'dashboard':
        return {
          background: 'bg-gradient-to-br from-green-50 to-emerald-50',
          spinner: 'text-green-600',
          title: 'text-green-900',
          subtitle: 'text-green-600',
          step: 'text-green-700',
          border: 'border-green-200'
        }
      default:
        return {
          background: 'bg-gradient-to-br from-gray-50 to-gray-100',
          spinner: 'text-gray-600',
          title: 'text-gray-900',
          subtitle: 'text-gray-600',
          step: 'text-gray-700',
          border: 'border-gray-200'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center ${styles.background}`}>
      <div className="text-center max-w-md mx-auto px-6">
        {/* Compilation Icon with Code Symbol */}
        <div className="mb-6 relative">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <Spinner size="lg" className={styles.spinner} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-3">
          <h2 className={`text-2xl font-bold ${styles.title}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`text-base ${styles.subtitle}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Compilation Step Indicator */}
        {compilationStep && (
          <div className={`mt-6 p-3 rounded-lg border ${styles.border} bg-white/50`}>
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 ${styles.spinner.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
              <span className={`text-sm font-medium ${styles.step}`}>
                {compilationStep}
              </span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 ${styles.spinner.replace('text-', 'bg-')} rounded-full animate-pulse`} 
                 style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Compilation Status */}
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span>TypeScript compilation</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <span>Bundle optimization</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <span>Hot reload ready</span>
          </div>
        </div>

        {/* Loading Dots Animation */}
        <div className="flex justify-center mt-6 space-x-1">
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

        {/* Helpful Tip */}
        <div className="mt-6 p-3 bg-white/30 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            💡 This usually takes a few seconds. The app will automatically refresh when ready.
          </p>
        </div>
      </div>
    </div>
  )
}

// Specific compilation loading components for different contexts
export function AdminCompilationLoading({ 
  title, 
  subtitle, 
  compilationStep 
}: Omit<CompilationLoadingProps, 'variant'>) {
  return (
    <CompilationLoading 
      variant="admin" 
      title={title || "Compiling Admin Panel..."} 
      subtitle={subtitle || "Building your admin dashboard"}
      compilationStep={compilationStep}
    />
  )
}

export function DashboardCompilationLoading({ 
  title, 
  subtitle, 
  compilationStep 
}: Omit<CompilationLoadingProps, 'variant'>) {
  return (
    <CompilationLoading 
      variant="dashboard" 
      title={title || "Compiling Dashboard..."} 
      subtitle={subtitle || "Building your personal dashboard"}
      compilationStep={compilationStep}
    />
  )
}

// Inline compilation loading for page sections
export function CompilationSectionLoading({ 
  title = "Compiling...", 
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
      <div className="relative mb-3">
        <Spinner size={size === "sm" ? "default" : size === "lg" ? "lg" : "default"} className="text-blue-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded border border-blue-200 flex items-center justify-center">
            <svg className="w-2 h-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
        </div>
      </div>
      <p className="text-blue-600 text-sm font-medium">{title}</p>
      <p className="text-gray-500 text-xs mt-1">Please wait...</p>
    </div>
  )
}
