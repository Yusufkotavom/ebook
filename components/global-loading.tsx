"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PageLoading, AdminPageLoading, DashboardPageLoading } from '@/components/page-loading'
import { CompilationLoading, AdminCompilationLoading, DashboardCompilationLoading } from '@/components/compilation-loading'
import { useLoading } from '@/hooks/use-loading'

export function GlobalLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const { isCompiling, compilationStep } = useLoading()

  useEffect(() => {
    // Show loading on route change
    setIsLoading(true)
    
    // Hide loading after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300) // Fast loading for good UX

    return () => clearTimeout(timer)
  }, [pathname])

  // Show compilation loading if app is compiling
  if (isCompiling) {
    if (pathname.startsWith('/admin')) {
      return <AdminCompilationLoading compilationStep={compilationStep} />
    }
    
    if (pathname.startsWith('/dashboard')) {
      return <DashboardCompilationLoading compilationStep={compilationStep} />
    }

    return <CompilationLoading compilationStep={compilationStep} />
  }

  // Show regular loading if not compiling
  if (!isLoading) return null

  // Choose loading variant based on route
  if (pathname.startsWith('/admin')) {
    return <AdminPageLoading title="Loading Admin Panel..." />
  }
  
  if (pathname.startsWith('/dashboard')) {
    return <DashboardPageLoading title="Loading Dashboard..." />
  }

  return <PageLoading title="Loading..." />
}