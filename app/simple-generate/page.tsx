'use client'

import { useState } from 'react'

export default function SimpleGeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const generateImage = async () => {
    if (!prompt.trim()) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          config: {
            mode: 'text-to-image',
            resolution: '2K',
            ratio: '1:1',
            count: 1
          }
        })
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
        <h1 className="text-3xl font-bold mb-8">Simple Image Generation</h1>
        
        <div className="mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32"
            disabled={loading}
          />
        </div>
        
        <button
          onClick={generateImage}
          disabled={loading || !prompt.trim()}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>

        {result && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="text-sm overflow-auto bg-white p-4 rounded mb-4">
              {JSON.stringify(result, null, 2)}
            </pre>
            
            {result.images && result.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Generated Images:</h3>
                {result.images.map((image: any, index: number) => (
                  <div key={index} className="mb-4">
                    <img 
                      src={image.url} 
                      alt={`Generated ${index + 1}`} 
                      className="max-w-full rounded-lg shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = ''
                        setResult({...result, error: `Image ${index + 1} failed to load`})
                      }}
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      URL: {image.url}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
