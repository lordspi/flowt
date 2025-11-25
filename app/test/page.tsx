'use client'

import { useState } from 'react'

export default function TestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/simple-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Request failed', details: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Seedream API Test</h1>
        
        <button
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Seedream API'}
        </button>

        {result && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="text-sm overflow-auto bg-white p-4 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
            
            {result.imageUrl && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Generated Image:</h3>
                <img 
                  src={result.imageUrl} 
                  alt="Generated" 
                  className="max-w-full rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = ''
                    setResult({...result, error: 'Image failed to load'})
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
