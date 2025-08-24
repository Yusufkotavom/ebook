"use client"

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
})

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Start progress when route changes
    const handleStart = () => {
      NProgress.start()
    }

    // Complete progress when route is loaded
    const handleComplete = () => {
      NProgress.done()
    }

    // Start loading
    handleStart()

    // Complete loading after a short delay to ensure the page is ready
    const timer = setTimeout(() => {
      handleComplete()
    }, 100)

    return () => {
      clearTimeout(timer)
      NProgress.done()
    }
  }, [pathname, searchParams])

  return null
}