"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface LoadingContextType {
  isLoading: boolean
  loadingMessage: string
  setLoading: (loading: boolean, message?: string) => void
  startLoading: (message?: string) => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

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

  return (
    <LoadingContext.Provider value={{
      isLoading,
      loadingMessage,
      setLoading,
      startLoading,
      stopLoading
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