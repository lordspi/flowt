'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home and rely on in-page pricing section
    router.replace('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-sm text-gray-500">
      Redirecting to pricing...
    </div>
  )
}
