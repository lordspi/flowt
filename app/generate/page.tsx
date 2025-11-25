'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Settings, Send, Download, Share2, X, RefreshCw, Grid3x3, Upload } from 'lucide-react'

export default function GeneratePage() {
  const router = useRouter()
  
  const [messages, setMessages] = useState<any[]>([])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState({ mode: 'Auto mode', resolution: '2K', ratio: '1:1', count: 15, credits: 0 })
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  // Load current user and credits
  useEffect(() => {
    let cancelled = false

    const loadUser = async () => {
      try {
        const res = await fetch('/api/user/me')
        if (res.status === 401) {
          // Redirect to custom sign-in page for unauthorized users
          router.push('/signin')
          return
        }
        if (!res.ok) {
          throw new Error('Failed to load user data')
        }
        const user = await res.json()
        if (!cancelled && typeof user.creditsBalance === 'number') {
          setConfig((prev) => ({ ...prev, credits: user.creditsBalance }))
          
          // Show low credit warning
          if (user.creditsBalance <= 5 && user.creditsBalance > 0) {
            setShowLowCreditWarning(true)
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
        if (!cancelled) router.push('/signin')
      } finally {
        if (!cancelled) setIsLoadingUser(false)
      }
    }

    loadUser()

    return () => {
      cancelled = true
    }
  }, [])

  const [showLowCreditWarning, setShowLowCreditWarning] = useState(false)
  const [showZeroCreditModal, setShowZeroCreditModal] = useState(false)

  // Read ?prompt= from URL on the client and trigger an initial generation once, after auth check
  useEffect(() => {
    if (isLoadingUser) return
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const urlPrompt = params.get('prompt') || ''
    if (urlPrompt) {
      handleGenerate(urlPrompt)
    }
    // we intentionally run this only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingUser])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const handleGenerate = async (promptText: string = prompt) => {
    if (!promptText.trim() || isGenerating) return

    // Check credits before generation
    if (config.credits <= 0) {
      setShowZeroCreditModal(true)
      return
    }

    if (config.credits <= 5) {
      setShowLowCreditWarning(true)
    }

    setIsGenerating(true)

    const newMessage = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      prompt: promptText,
      mode: 'Multi-image',
      resolution: config.resolution,
      ratio: config.ratio,
      model: 'Flowt-2.0',
      count: config.count,
      status: 'generating',
      images: [],
    }

    setMessages((prev) => [...prev, newMessage])
    setPrompt('')
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptText,
          config,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate images')
      }

      const data = await response.json()
      
      console.log('API Response:', data) // Debug log

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? {
                ...msg,
                status: data.status ?? 'complete',
                count: data.config?.count ?? newMessage.count,
                images: Array.isArray(data.images) 
                  ? data.images.map((img: any) => typeof img === 'string' ? img : img.url).filter(Boolean)
                  : [],
              }
            : msg,
        ),
      )
      if (typeof data.remainingCredits === 'number') {
        setConfig((prev) => ({ ...prev, credits: data.remainingCredits }))
      } else {
        setConfig((prev) => ({ ...prev, credits: Math.max(0, prev.credits - (data.config?.count ?? newMessage.count)) }))
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? {
                ...msg,
                status: 'error',
              }
            : msg,
        ),
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReEdit = (promptText: string) => {
    setPrompt(promptText)
    scrollToBottom()
    // focus after DOM update
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  return (
    <div className="h-screen flex flex-col bg-[#F4F5F7]">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm md:text-base">Flowt Ad Studio 2.0</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-700">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>{config.credits} credits</span>
          </div>
          
          {/* Upgrade button - show when credits are low */}
          {(config.credits <= 5 || config.credits === 0) && (
            <button
              onClick={() => router.push('/#pricing')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium shadow-sm hover:shadow-md transition-shadow"
            >
              <span>⚡ Upgrade</span>
            </button>
          )}
          
          <button
            onClick={() => router.push('/gallery')}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            <Grid3x3 className="w-4 h-4" />
            <span className="hidden md:inline">Gallery</span>
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
            aria-label="Open configuration"
          >
            <Settings className="w-5 h-5 text-gray-700" />
          </button>
          <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white/80" />
            <span>Dashboard</span>
          </div>
        </div>
      </header>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4">
        <div className="max-w-5xl mx-auto space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 pt-10">
            <div className="w-16 h-16 mb-4 opacity-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg">Experience image generation. Let the creativity shake</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 text-[11px] text-gray-500 pl-1">
                <span>{msg.timestamp}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{msg.model}</span>
              </div>

              <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
                <p className="text-gray-900 text-sm md:text-base mb-3">{msg.prompt}</p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">{msg.ratio}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">{msg.resolution}</span>
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">{msg.mode}</span>
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded">{msg.model}</span>
                </div>
              </div>

              {msg.status === 'generating' ? (
                <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {Array.from({ length: msg.count || 0 }).map((_, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs md:text-sm text-gray-500">
                    <span>
                      Generating {msg.count}{' '}
                      {msg.count === 1 ? 'image' : 'images'}…
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      Using Flowt 2.0
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                    {msg.images.length > 0 ? (
                      msg.images.map((img: string, idx: number) => (
                        <div
                          key={idx}
                          className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100"
                        >
                          <img 
                            src={img} 
                            alt={`Generated ${idx + 1}`} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { 
                              console.log('Image failed to load:', img)
                              e.currentTarget.src = `https://picsum.photos/seed/${msg.prompt?.replace(/\s+/g, '-')}-${idx}/512/512.jpg` 
                            }} 
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button className="p-2 bg-white rounded-full hover:scale-110 transition-transform">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-white rounded-full hover:scale-110 transition-transform">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Fallback demo images
                      Array.from({ length: msg.count || 1 }, (_, idx) => (
                        <div
                          key={idx}
                          className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100"
                        >
                          <img 
                            src={`https://picsum.photos/seed/${msg.prompt?.replace(/\s+/g, '-')}-${idx}/512/512.jpg`} 
                            alt={`Generated ${idx + 1}`} 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button className="p-2 bg-white rounded-full hover:scale-110 transition-transform">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-white rounded-full hover:scale-110 transition-transform">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => handleReEdit(msg.prompt)}
                    className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    re-edit
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT BAR - Fixed at bottom, compact floating chatbot */}
      <div className="p-2.5 md:p-3">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl px-3.5 md:px-5 py-3.5 md:py-4 border border-gray-100 scale-[0.7] md:scale-[0.75] origin-bottom">
            <div className="flex gap-3 md:gap-4 items-start">
              <button className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                <Upload className="w-5 h-5" />
              </button>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2 text-sm md:text-base">
                  <span className="text-blue-600 font-medium">Auto Group Mode</span>
                  <span className="text-gray-400">Describe the image you want to generate</span>
                </div>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleGenerate()
                      }
                    }}
                    ref={inputRef}
                    className="w-full h-16 md:h-20 px-0 pr-2 pb-1 pt-1 border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-transparent resize-none text-sm md:text-base text-gray-800 placeholder:text-gray-400 bg-transparent"
                    placeholder="Write a detailed description, e.g. product photo, lighting, background..."
                    disabled={isGenerating}
                  />
                </div>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2 md:gap-3 items-center text-xs md:text-sm">
              <div className="px-3 py-1.5 border border-gray-200 rounded-xl bg-gray-50 text-xs md:text-sm text-gray-700 flex items-center gap-2 select-none">
                <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">Auto</span>
                <span>group image</span>
              </div>
              <button
                onClick={() => setShowConfig(true)}
                className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs md:text-sm text-gray-800 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                {config.resolution}
              </button>
              <button
                onClick={() => setShowConfig(true)}
                className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs md:text-sm text-gray-800 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                {config.ratio}
              </button>
              <button
                onClick={() => setShowConfig(true)}
                className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs md:text-sm text-gray-800 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                {config.count} {config.count === 1 ? 'image' : 'images'}
              </button>
              <button
                onClick={() => handleGenerate()}
                disabled={!prompt.trim() || isGenerating}
                className="ml-auto w-8 h-8 md:w-9 md:h-9 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-md hover:bg-purple-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-3 text-xs text-center text-gray-500">
            Flowt Ad Studio 2.0 is your AI ad creative partner generate scroll-stopping campaigns in seconds and iterate faster than ever.
          </div>
        </div>
      </div>

      {/* CONFIG PANEL - same controls as landing page, labelled Dashboard */}
      <AnimatePresence>
        {showConfig && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfig(false)} className="fixed inset-0 bg-black/20 z-50" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                      <Settings className="w-4 h-4" />
                    </span>
                    <h2 className="text-xl font-semibold">Configuration</h2>
                  </div>
                  <button onClick={() => setShowConfig(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Remaining credits: </span>
                <span className="text-3xl font-bold text-purple-600">{config.credits}</span>
                <span className="text-sm text-gray-500 ml-2">images this period</span>
              </div>

                {/* Resolution */}
                <div className="mb-5">
                  <div className="mb-2 text-xs font-medium text-gray-500">Resolution</div>
                  <div className="inline-flex gap-2 rounded-xl bg-gray-50 p-1">
                    {['2K', '4K'].map((res) => (
                      <button
                        key={res}
                        onClick={() => setConfig({ ...config, resolution: res })}
                        className={`px-4 py-1.5 text-xs rounded-lg border transition-all ${
                          config.resolution === res
                            ? 'border-purple-500 bg-white text-purple-600 shadow-sm'
                            : 'border-transparent text-gray-600 hover:bg-white'
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect ratio */}
                <div className="mb-5">
                  <div className="mb-2 text-xs font-medium text-gray-500">Aspect ratio</div>
                  <div className="grid grid-cols-4 gap-2">
                    {['1:1', '3:4', '4:3', '16:9', '9:16', '2:3', '3:2', '21:9'].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setConfig({ ...config, ratio })}
                        className={`py-1.5 text-xs rounded-lg border transition-all ${
                          config.ratio === ratio
                            ? 'border-purple-500 bg-white text-purple-600 shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:border-purple-200'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Maximum images per generation */}
                <div className="mb-5">
                  <div className="mb-2 text-xs font-medium text-gray-500">
                    Maximum images to generate per request
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={config.count}
                      onChange={(e) =>
                        setConfig({ ...config, count: parseInt(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={config.count}
                      onChange={(e) =>
                        setConfig({ ...config, count: parseInt(e.target.value) })
                      }
                      className="w-16 px-2 py-1 border rounded text-center text-xs"
                    />
                  </div>
                </div>

                {/* Image size */}
                <div className="mb-2 text-xs font-medium text-gray-500">Image size</div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-6">
                  <span>W</span>
                  <input
                    type="number"
                    defaultValue="2048"
                    className="flex-1 px-2 py-1 border rounded"
                  />
                  <span className="text-gray-400">⇄</span>
                  <span>H</span>
                  <input
                    type="number"
                    defaultValue="2048"
                    className="flex-1 px-2 py-1 border rounded"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Low Credit Warning */}
      {showLowCreditWarning && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-yellow-600 text-xs">⚠️</span>
            </div>
            <div>
              <p className="font-medium text-yellow-800 text-sm">Low on credits!</p>
              <p className="text-yellow-700 text-xs mt-1">You have {config.credits} credits left. Upgrade to keep generating amazing images.</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => router.push('/#pricing')}
                  className="px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Upgrade Now
                </button>
                <button
                  onClick={() => setShowLowCreditWarning(false)}
                  className="px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zero Credit Modal */}
      {showZeroCreditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">💳</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">No credits left!</h3>
                <p className="text-gray-600 text-sm mt-2">
                  You've used all your free credits. Upgrade to a paid plan to continue creating amazing AI images with Flowt 2.0.
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    setShowZeroCreditModal(false)
                    router.push('/#pricing')
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Upgrade to Continue
                </button>
                <button
                  onClick={() => setShowZeroCreditModal(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
