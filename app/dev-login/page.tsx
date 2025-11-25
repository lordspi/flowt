'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DevLoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDevLogin = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/dev-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Store mock session in localStorage
        localStorage.setItem('dev-user', JSON.stringify(data.user))
        
        // Redirect to generate page
        router.push('/generate')
        
        alert('Development login successful! Redirecting to generate page...')
      } else {
        alert('Development login failed')
      }
    } catch (error) {
      alert('Error: ' + String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Development Login</h1>
        <p className="text-gray-600 mb-8">
          Quick bypass for localhost testing - no OAuth required
        </p>
        
        <button
          onClick={handleDevLogin}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
        >
          {loading ? 'Logging in...' : 'Login as Development User'}
        </button>
        
        <div className="mt-8 p-4 bg-gray-100 rounded text-sm">
          <p className="font-semibold mb-2">Mock User Details:</p>
          <ul className="text-left text-gray-600">
            <li>• Email: dev@test.com</li>
            <li>• Plan: FREE</li>
            <li>• Credits: 15</li>
            <li>• No OAuth required</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
