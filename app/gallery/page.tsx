'use client'

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

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sample gallery items - REPLACE WITH YOUR DATA
  const galleryItems = [
    { id: 1, prompt: 'A beautiful sunset over the ocean with dolphins jumping', image: '/assets/flowt/generated-1.jpg', timestamp: '11-15 23:24', model: 'Flowt-2.0' },
    { id: 2, prompt: 'Generate a cinematic ad out of this image', image: '/assets/flowt/generated-2.jpg', timestamp: '11-13 05:41', model: 'Flowt-2.0' },
    { id: 3, prompt: 'Comic book style superhero character', image: '/assets/flowt/carousel-comics.jpg', timestamp: '11-11 14:35', model: 'Flowt-2.0' },
    { id: 4, prompt: 'Product photography of luxury handbag', image: '/assets/flowt/carousel-commercial.jpg', timestamp: '11-10 09:15', model: 'Flowt-2.0' },
    { id: 5, prompt: 'Artistic poster design with bold typography', image: '/assets/flowt/carousel-poster.jpg', timestamp: '11-09 16:42', model: 'Flowt-2.0' },
  ]

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
                  <img
                    src={item.image}
                    alt={item.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23ddd' width='400' height='400'/%3E%3Ctext fill='%23999' font-family='Arial' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EGallery Image%3C/text%3E%3C/svg%3E` 
                    }}
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded">
                    {item.model}
                  </div>
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
                      ? 'w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0'
                      : 'w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0'
                  }
                >
                  <img src={item.image} alt={item.prompt} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 mb-1">{item.prompt}</p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span>{item.timestamp}</span>
                    <span>•</span>
                    <span>{item.model}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {galleryItems.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500">No generations yet. Start creating!</p>
          </div>
        )}
      </div>
    </div>
  )
}
