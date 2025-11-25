'use client'

import { useState } from 'react'

export default function NoAuthTestPage() {
  const [prompt, setPrompt] = useState('A beautiful sunset over mountains')
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

  const testSimpleAPI = async () => {
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
      setResult({ error: 'Simple test failed', details: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">No Auth Required - AI Generation Test</h1>
        <p className="text-gray-600 mb-8">Direct API testing - no sign-in needed</p>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Prompt:</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg resize-none h-24"
            disabled={loading}
          />
        </div>
        
        <div className="flex gap-4 mb-8">
          <button
            onClick={generateImage}
            disabled={loading || !prompt.trim()}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
          >
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
          
          <button
            onClick={testSimpleAPI}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
          >
            {loading ? 'Testing...' : 'Test Simple API'}
          </button>
        </div>

        {result && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="text-sm overflow-auto bg-white p-4 rounded mb-4 max-h-96">
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
                    <p className="text-sm text-gray-600 mt-2 break-all">
                      URL: {image.url}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            {result.imageUrl && (
              <div>
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
                <p className="text-sm text-gray-600 mt-2 break-all">
                  URL: {result.imageUrl}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
