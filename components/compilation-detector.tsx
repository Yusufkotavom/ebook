"use client"

import { useEffect } from 'react'
import { useLoading } from '@/hooks/use-loading'

// This component detects compilation in development mode
export function CompilationDetector() {
  const { startCompilation, stopCompilation, updateCompilationStep } = useLoading()

  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    let compilationTimeout: NodeJS.Timeout
    let compilationInterval: NodeJS.Timeout

    // Function to start compilation detection
    const startCompilationDetection = () => {
      startCompilation('TypeScript compilation')
      
      // Simulate compilation steps
      const steps = [
        'TypeScript compilation',
        'Bundle optimization',
        'Code splitting',
        'Hot reload ready'
      ]
      
      let currentStep = 0
      compilationInterval = setInterval(() => {
        if (currentStep < steps.length) {
          updateCompilationStep(steps[currentStep])
          currentStep++
        } else {
          clearInterval(compilationInterval)
          // Stop compilation after a short delay
          compilationTimeout = setTimeout(() => {
            stopCompilation()
          }, 500)
        }
      }, 600)
    }

    // Listen for webpack compilation events (development only)
    if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__) {
      // Check if webpack is compiling by monitoring the page
      const checkCompilation = () => {
        // This is a simple heuristic - in a real app you might use webpack HMR events
        const hasCompilationErrors = document.querySelector('[data-nextjs-dialog-overlay]')
        const hasLoadingIndicator = document.querySelector('[data-nextjs-loading]')
        
        if (hasCompilationErrors || hasLoadingIndicator) {
          startCompilationDetection()
        }
      }

      // Check periodically for compilation indicators
      const compilationCheckInterval = setInterval(checkCompilation, 1000)
      
      return () => {
        clearInterval(compilationCheckInterval)
        clearTimeout(compilationTimeout)
        clearInterval(compilationInterval)
        stopCompilation()
      }
    }

    // Fallback: simulate compilation on route changes in development
    const handleRouteChange = () => {
      startCompilationDetection()
    }

    // Listen for route changes
    window.addEventListener('beforeunload', handleRouteChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleRouteChange)
      clearTimeout(compilationTimeout)
      clearInterval(compilationInterval)
      stopCompilation()
    }
  }, [startCompilation, stopCompilation, updateCompilationStep])

  // This component doesn't render anything
  return null
}

// Alternative: Manual compilation trigger for testing
export function useManualCompilation() {
  const { startCompilation, stopCompilation, updateCompilationStep } = useLoading()

  const triggerCompilation = (step?: string) => {
    startCompilation(step || 'Manual compilation triggered')
    
    // Simulate compilation process
    const steps = [
      'TypeScript compilation',
      'Bundle optimization', 
      'Code splitting',
      'Hot reload ready'
    ]
    
    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        updateCompilationStep(steps[currentStep])
        currentStep++
      } else {
        clearInterval(interval)
        setTimeout(() => stopCompilation(), 500)
      }
    }, 800)

    return () => clearInterval(interval)
  }

  return { triggerCompilation, stopCompilation }
}

// Development-only compilation indicator
export function DevCompilationIndicator() {
  const { isCompiling, compilationStep } = useLoading()

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !isCompiling) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">Compiling...</span>
      </div>
      {compilationStep && (
        <div className="text-xs mt-1 opacity-90">{compilationStep}</div>
      )}
    </div>
  )
}
