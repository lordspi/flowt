'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Grid3x3, List, Search } from 'lucide-react'

export default function GalleryPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [sortOption, setSortOption] = useState<'newest' | 'oldest'>('newest')

  const [mounted, setMounted] = useState(false)
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetchGenerations()
  }, [])

  const fetchGenerations = async () => {
    try {
      const res = await fetch('/api/generations')
      if (res.status === 401) {
        router.push('/signin')
        return
      }
      if (!res.ok) {
        throw new Error('Failed to fetch generations')
      }
      const data = await res.json()
      
      // Transform data to match gallery format
      const transformedData = data.map((gen: any) => ({
        id: gen.id,
        prompt: gen.prompt,
        timestamp: gen.timestamp,
        model: gen.model,
        image: gen.images?.[0]?.url || `https://picsum.photos/seed/${gen.prompt?.replace(/\s+/g, '-')}/400/400.jpg`,
        images: gen.images || [],
        count: gen.count,
        status: gen.status,
      }))
      
      setGalleryItems(transformedData)
    } catch (error) {
      console.error('Error fetching generations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  const filteredItems = galleryItems.filter((item) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      item.prompt.toLowerCase().includes(query) ||
      item.model.toLowerCase().includes(query) ||
      item.timestamp.toLowerCase().includes(query)
    )
  })

  const parseTimestamp = (timestamp: string) => {
    // expects format "MM-DD HH:MM"; fall back safely if parsing fails
    try {
      const [md, hm] = timestamp.split(' ')
      const [month, day] = md.split('-').map(Number)
      const [hour, minute] = hm.split(':').map(Number)
      return new Date(2025, (month || 1) - 1, day || 1, hour || 0, minute || 0).getTime()
    } catch {
      return 0
    }
  }

  const sortedItems = [...filteredItems].sort((a, b) => {
    const timeA = parseTimestamp(a.timestamp)
    const timeB = parseTimestamp(b.timestamp)

    if (sortOption === 'newest') {
      return timeB - timeA
    }
    return timeA - timeB
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">Flowt 2.0</h1>
                <p className="text-sm text-gray-500">Gallery</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search generations..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none w-64"
                />
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <select
                  value={density}
                  onChange={(e) => setDensity(e.target.value as 'comfortable' | 'compact')}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none focus:border-purple-500"
                >
                  <option value="comfortable">Standard grid</option>
                  <option value="compact">Compact grid</option>
                </select>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as 'newest' | 'oldest')}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none focus:border-purple-500"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* GALLERY CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading your gallery...</h3>
            <p className="text-gray-500">Fetching your amazing creations</p>
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your gallery is empty</h3>
            <p className="text-gray-500 mb-6">Start creating amazing images with Flowt 2.0!</p>
            <button
              onClick={() => router.push('/generate')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              Create Your First Image
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div
                className={`grid grid-cols-1 md:grid-cols-2 ${
                  density === 'comfortable'
                    ? 'lg:grid-cols-3 gap-6'
                    : 'lg:grid-cols-5 gap-3'
                }`}
              >
                {sortedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => router.push(`/generate?prompt=${encodeURIComponent(item.prompt)}`)}
                  >
                    <div className="aspect-square relative bg-gray-100">
                      {item.images && item.images.length > 0 ? (
                        <div className="relative w-full h-full">
                          <img
                            src={item.images[0].url}
                            alt={item.prompt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = `https://picsum.photos/seed/${item.prompt?.replace(/\s+/g, '-')}/400/400.jpg` 
                            }}
                          />
                          {item.images.length > 1 && (
                            <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded">
                              +{item.images.length - 1} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <img
                          src={item.image}
                          alt={item.prompt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = `https://picsum.photos/seed/${item.prompt?.replace(/\s+/g, '-')}/400/400.jpg` 
                          }}
                        />
                      )}
                      <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded">
                        {item.model}
                      </div>
                      {item.count > 1 && (
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-purple-600/80 backdrop-blur-sm text-white text-xs rounded">
                          {item.count} images
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-900 line-clamp-2 mb-2">{item.prompt}</p>
                      <p className="text-xs text-gray-500">{item.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className={density === 'comfortable' ? 'space-y-4' : 'space-y-2'}>
                {sortedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={
                      density === 'comfortable'
                        ? 'bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex gap-4 cursor-pointer'
                        : 'bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex gap-3 cursor-pointer'
                    }
                    onClick={() => router.push(`/generate?prompt=${encodeURIComponent(item.prompt)}`)}
                  >
                    <div
                      className={
                        density === 'comfortable'
                          ? 'w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative'
                          : 'w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 relative'
                      }
                    >
                      {item.images && item.images.length > 0 ? (
                        <React.Fragment>
                          <img 
                            src={item.images[0].url} 
                            alt={item.prompt} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.src = `https://picsum.photos/seed/${item.prompt?.replace(/\s+/g, '-')}/400/400.jpg` 
                            }}
                          />
                          {item.images.length > 1 && (
                            <div className="absolute top-1 right-1 px-1 py-0.5 bg-black/70 backdrop-blur-sm text-white text-xs rounded">
                              +{item.images.length - 1}
                            </div>
                          )}
                        </React.Fragment>
                      ) : (
                        <img 
                          src={item.image} 
                          alt={item.prompt} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = `https://picsum.photos/seed/${item.prompt?.replace(/\s+/g, '-')}/400/400.jpg` 
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 mb-1">{item.prompt}</p>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>{item.timestamp}</span>
                        <span>•</span>
                        <span>{item.model}</span>
                        {item.count > 1 && (
                          <React.Fragment>
                            <span>•</span>
                            <span>{item.count} images</span>
                          </React.Fragment>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
