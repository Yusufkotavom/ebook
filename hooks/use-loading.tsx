"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface LoadingContextType {
  isLoading: boolean
  loadingMessage: string
  isCompiling: boolean
  compilationStep: string
  setLoading: (loading: boolean, message?: string) => void
  startLoading: (message?: string) => void
  stopLoading: () => void
  startCompilation: (step?: string) => void
  updateCompilationStep: (step: string) => void
  stopCompilation: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [isCompiling, setIsCompiling] = useState(false)
  const [compilationStep, setCompilationStep] = useState('')

  const setLoading = (loading: boolean, message: string = '') => {
    setIsLoading(loading)
    setLoadingMessage(message)
  }

  const startLoading = (message: string = 'Loading...') => {
    setIsLoading(true)
    setLoadingMessage(message)
  }

  const stopLoading = () => {
    setIsLoading(false)
    setLoadingMessage('')
  }

  const startCompilation = (step: string = 'Initializing...') => {
    setIsCompiling(true)
    setCompilationStep(step)
  }

  const updateCompilationStep = (step: string) => {
    setCompilationStep(step)
  }

  const stopCompilation = () => {
    setIsCompiling(false)
    setCompilationStep('')
  }

  return (
    <LoadingContext.Provider value={{
      isLoading,
      loadingMessage,
      isCompiling,
      compilationStep,
      setLoading,
      startLoading,
      stopLoading,
      startCompilation,
      updateCompilationStep,
      stopCompilation
    }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

// Hook for page-specific loading
export function usePageLoading() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const startLoading = () => {
    setIsLoading(true)
    setError(null)
  }

  const stopLoading = () => {
    setIsLoading(false)
  }

  const setLoadingError = (errorMessage: string) => {
    setIsLoading(false)
    setError(errorMessage)
  }

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError
  }
}

// Hook for compilation-specific loading
export function useCompilationLoading() {
  const [isCompiling, setIsCompiling] = useState(false)
  const [compilationStep, setCompilationStep] = useState('')
  const [compilationProgress, setCompilationProgress] = useState(0)

  const startCompilation = (step: string = 'Initializing...') => {
    setIsCompiling(true)
    setCompilationStep(step)
    setCompilationProgress(0)
  }

  const updateCompilationStep = (step: string, progress?: number) => {
    setCompilationStep(step)
    if (progress !== undefined) {
      setCompilationProgress(progress)
    }
  }

  const stopCompilation = () => {
    setIsCompiling(false)
    setCompilationStep('')
    setCompilationProgress(0)
  }

  const simulateCompilationProgress = () => {
    // Simulate compilation progress for better UX
    const steps = [
      'TypeScript compilation',
      'Bundle optimization', 
      'Code splitting',
      'Hot reload ready'
    ]
    
    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        updateCompilationStep(steps[currentStep], (currentStep + 1) * 25)
        currentStep++
      } else {
        clearInterval(interval)
        stopCompilation()
      }
    }, 800)

    return () => clearInterval(interval)
  }

  return {
    isCompiling,
    compilationStep,
    compilationProgress,
    startCompilation,
    updateCompilationStep,
    stopCompilation,
    simulateCompilationProgress
  }
}