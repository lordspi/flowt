'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Upload, Settings, X } from 'lucide-react'

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(2)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [prompt, setPrompt] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState({
    mode: 'Auto mode',
    resolution: '2K',
    ratio: '1:1',
    count: 15,
    credits: 198,
  })
  const router = useRouter()

  const cards = [
    {
      id: 0,
      title: 'Product ads',
      image: '/assets/flowt/carousel-comics.jpg',
      label: 'High-converting product creatives for every channel.',
    },
    {
      id: 1,
      title: 'Commercial photography',
      image: '/assets/flowt/carousel-commercial.jpg',
      label: 'Studio-quality shots without studio costs.',
    },
    {
      id: 2,
      title: 'Carousel ads',
      image: '/assets/flowt/carousel-storybook.jpg',
      label: 'Multi-frame stories optimised for CTR.',
    },
    {
      id: 3,
      title: 'Static image ads',
      image: '/assets/flowt/carousel-blindbox.jpg',
      label: 'Thumb-stopping single-image assets.',
    },
    {
      id: 4,
      title: 'Brand storytelling',
      image: '/assets/flowt/carousel-poster.jpg',
      label: 'On-brand visuals for every stage of the funnel.',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [cards.length])

  const handleGenerate = () => {
    if (prompt.trim()) {
      router.push(`/generate?prompt=${encodeURIComponent(prompt)}`)
    }
  }

  const handleGoDashboard = () => {
    if (prompt.trim()) {
      router.push(`/generate?prompt=${encodeURIComponent(prompt)}`)
    } else {
      router.push('/generate')
    }
  }

  return (
    <>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded" />
            <span className="text-lg font-semibold tracking-tight">Flowt</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button className="text-gray-600 hover:text-gray-900">Examples</button>
            <button className="text-gray-600 hover:text-gray-900">Pricing</button>
            <button
              onClick={handleGoDashboard}
              className="px-3 py-1.5 border border-gray-200 rounded-full hover:border-gray-300"
            >
              Dashboard
            </button>
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
              R
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT BACKGROUND */}
      <div
        className="pt-24 pb-12 min-h-screen"
        style={{
          backgroundColor: '#ffffff',
          backgroundImage:
            'radial-gradient(circle, rgba(148,163,184,0.44) 1.1px, transparent 0), radial-gradient(circle, rgba(59,130,246,0.35) 1.1px, transparent 0)',
          backgroundSize: '20px 20px, 20px 20px',
          backgroundPosition: '0 0, 10px 10px',
          backgroundRepeat: 'repeat, repeat',
        }}
      >
        {/* HERO + CAROUSEL + CHATBOT (kept inside scaled container) */}
        <div
          className="origin-top mx-auto"
          style={{
            transform: 'scale(0.7)',
            maxWidth: '1200px',
          }}
        >
          {/* Hero Title */}
          <div className="max-w-4xl mx-auto text-center mb-8 px-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3"
            >
              Flowt Ad Studio{' '}
              <span
                className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent inline-block"
                style={{ backgroundSize: '200% auto', animation: 'gradient 3s ease infinite' }}
              >
                2.0
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-gray-600"
            >
              Increase your campaign ROI by up to 300% with Flowt 2.0&apos;s AI-optimised ad creatives that are built to
              perform, not just look good.
            </motion.p>
          </div>

          {/* 3D CAROUSEL */}
          <div
            className="relative h-[320px] md:h-[360px] flex items-center justify-center mb-10"
            style={{ perspective: '1400px' }}
          >
            {cards.map((card, index) => {
              const relative = (index - currentIndex + cards.length) % cards.length
              const isCenter = relative === 0

              const position =
                relative === 0
                  ? { x: 0, z: 0, rotateY: 0, scale: 1.1, opacity: 1 }
                  : relative === 4
                  ? { x: -340, z: -200, rotateY: 45, scale: 0.9, opacity: 0.9 }
                  : relative === 1
                  ? { x: 340, z: -200, rotateY: -45, scale: 0.9, opacity: 0.9 }
                  : relative === 3
                  ? { x: -620, z: -400, rotateY: 60, scale: 0.75, opacity: 0.7 }
                  : { x: 620, z: -400, rotateY: -60, scale: 0.75, opacity: 0.7 }

              return (
                <motion.div
                  key={card.id}
                  className="absolute w-60 h-60 md:w-64 md:h-64 cursor-pointer"
                  animate={position}
                  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                  onClick={() => setCurrentIndex(index)}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-gray-200">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23ddd" width="400" height="500"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' +
                          card.title +
                          '%3C/text%3E%3C/svg%3E'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4 px-4 py-2 bg-black/70 backdrop-blur-sm text-white text-sm rounded-full border border-white/20">
                      {card.title}
                    </div>
                    <AnimatePresence>
                      {hoveredCard === index && isCenter && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center p-6"
                        >
                          <p className="text-white text-center text-sm md:text-base max-w-xs">
                            {card.label}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}

            <button
              onClick={() => setCurrentIndex((p) => (p - 1 + cards.length) % cards.length)}
              className="absolute -left-6 z-10 p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentIndex((p) => (p + 1) % cards.length)}
              className="absolute -right-6 z-10 p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-purple-600 w-8' : 'bg-gray-300 w-2'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* INPUT SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-5xl mx-auto px-4 md:px-6 mt-10"
          >
            <div className="bg-white rounded-3xl shadow-2xl px-5 md:px-8 py-5 md:py-6 border border-gray-100">
              <div className="flex gap-4 md:gap-5 items-start">
                <button className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 hover:border-purple-300 hover:bg-purple-50 transition-colors">
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
                      className="w-full h-20 md:h-24 px-0 pr-2 pb-1 pt-1 border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-transparent resize-none text-base md:text-lg text-gray-800 placeholder:text-gray-400 bg-transparent"
                      placeholder="Write a detailed description, e.g. product photo, lighting, background..."
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 items-center">
                <div className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-xs md:text-sm text-gray-700 flex items-center gap-2 select-none">
                  <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                    Auto
                  </span>
                  <span>group image</span>
                </div>
                <button
                  onClick={() => setShowConfig(true)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs md:text-sm text-gray-800 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  {config.resolution}
                </button>
                <button
                  onClick={() => setShowConfig(true)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs md:text-sm text-gray-800 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  {config.ratio}
                </button>
                <button
                  onClick={() => setShowConfig(true)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs md:text-sm text-gray-800 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  {config.count}pcs
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="ml-auto w-9 h-9 md:w-10 md:h-10 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-md hover:bg-purple-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="mt-6 text-sm text-gray-500 text-center">
              Flowt Ad Studio 2.0 is your AI ad creative partner – generate scroll-stopping campaigns in seconds and
              iterate faster than ever.
            </div>
          </motion.div>
        </div>

        {/* MARKETING SECTIONS – FULL WIDTH */}
        <div className="max-w-6xl mx-auto px-6 pb-16 space-y-20 mt-10">
          {/* Ad formats section */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="rounded-3xl bg-white/90 border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-6 md:px-10 md:py-8 border-b border-gray-100 bg-gradient-to-r from-white via-purple-50/40 to-blue-50/40">
                <p className="text-xs uppercase tracking-[0.2em] text-purple-500 mb-2">FORMATS</p>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                  Ad formats Flowt powers
                </h2>
                <p className="text-sm md:text-base text-gray-600 max-w-2xl">
                  From solo founders to performance teams, Flowt turns a single brief into high-performing static ads,
                  carousels, launch visuals and more – without a studio or design team.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
                {/* Static feed ads */}
                <div className="bg-white px-6 py-6 md:px-8 md:py-7 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Static feed ads</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Turn a single product shot into multiple scroll-stopping static creatives optimised for Meta,
                      Google and TikTok placements.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                      <span className="px-2 py-1 rounded-full bg-gray-100">Static ads</span>
                      <span className="px-2 py-1 rounded-full bg-gray-100">High CTR visuals</span>
                      <span className="px-2 py-1 rounded-full bg-gray-100">Brand-safe</span>
                    </div>
                  </div>
                  <div className="w-full md:w-40 h-32 rounded-2xl bg-gray-100 overflow-hidden">
                    <img
                      src="/assets/flowt/generated-1.jpg"
                      alt="Static ad example"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Carousel ads */}
                <div className="bg-white px-6 py-6 md:px-8 md:py-7 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Carousel ads</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Tell a richer product story across 3–7 frames – Flowt keeps lighting, angle and style consistent
                      so the whole carousel feels crafted.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                      <span className="px-2 py-1 rounded-full bg-gray-100">Multi-image stories</span>
                      <span className="px-2 py-1 rounded-full bg-gray-100">Consistency</span>
                      <span className="px-2 py-1 rounded-full bg-gray-100">Thumb-stopping</span>
                    </div>
                  </div>
                  <div className="w-full md:w-40 h-32 rounded-2xl bg-gray-100 overflow-hidden">
                    <img
                      src="/assets/flowt/carousel-storybook.jpg"
                      alt="Carousel example"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Commercial-style shots */}
                <div className="bg-white px-6 py-6 md:px-8 md:py-7 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Commercial-style shots</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Get studio-style product and lifestyle photography without studio schedules, crews or equipment
                      costs.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                      <span className="px-2 py-1 rounded-full bg-gray-100">Studio look</span>
                      <span className="px-2 py-1 rounded-full bg-gray-100">Lifestyle</span>
                      <span className="px-2 py-1 rounded-full bg-gray-100">No shoot needed</span>
                    </div>
                  </div>
                  <div className="w-full md:w-40 h-32 rounded-2xl bg-gray-100 overflow-hidden">
                    <img
                      src="/assets/flowt/carousel-commercial.jpg"
                      alt="Commercial example"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Launch posters & hero visuals */}
                <div className="bg-white px-6 py-6 md:px-8 md:py-7 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                      Launch posters &amp; hero visuals
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Generate campaign-ready posters and hero images for drops, sales and announcements in minutes.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                      <span className="px-2 py-1 rounded-full bg-gray-100">Launch campaigns</span>
                      <span className="px-2 py-1 rounded-full bg-gray-100">Hero creatives</span>
                      <span className="px-2 py-1 rounded-full bg-gray-100">Platform-ready</span>
                    </div>
                  </div>
                  <div className="w-full md:w-40 h-32 rounded-2xl bg-gray-100 overflow-hidden">
                    <img
                      src="/assets/flowt/carousel-poster.jpg"
                      alt="Poster example"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Cost & performance section */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 md:p-8 shadow-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
                <div className="md:col-span-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70 mb-2">PERFORMANCE</p>
                  <h2 className="text-2xl md:text-3xl font-semibold mb-3">
                    Cut creative costs, increase test volume.
                  </h2>
                  <p className="text-sm md:text-base text-white/80">
                    Replace slow, expensive production cycles with AI-native ad creation so you can ship more creatives
                    and find winners faster.
                  </p>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                    <p className="text-xs text-white/70 mb-1">Creative speed</p>
                    <p className="text-xl font-semibold mb-1">10× faster</p>
                    <p className="text-xs text-white/80">
                      Launch new ad concepts in hours instead of waiting on agency or studio timelines.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                    <p className="text-xs text-white/70 mb-1">Variant volume</p>
                    <p className="text-xl font-semibold mb-1">Up to 15 variants</p>
                    <p className="text-xs text-white/80">
                      Generate full sets of creatives from a single prompt and product image.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                    <p className="text-xs text-white/70 mb-1">Production cost</p>
                    <p className="text-xl font-semibold mb-1">Up to 80% savings</p>
                    <p className="text-xs text-white/80">
                      Cut back on shoot, editing and design costs while keeping a studio-grade look.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Re-edit & workflow section */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
              className="rounded-3xl bg-white/95 border border-gray-100 shadow-sm p-6 md:p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-purple-500 mb-2">WORKFLOW</p>
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                    Built for constant re-editing and testing.
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-4">
                    Every generation in Flowt is a starting point, not a final file. Re-open any prompt, tweak the brief
                    and generate a fresh batch of creatives in seconds.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      <span className="font-medium text-purple-600">Re-edit from the dashboard:</span>{' '}
                      click{' '}
                      <span className="font-mono text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                        re-edit
                      </span>{' '}
                      under any generation to send its prompt back into the chatbot.
                    </li>
                    <li>
                      <span className="font-medium text-purple-600">Re-use winners from the Gallery:</span> pick past
                      high-performers, adjust copy or angle and spin out new variants.
                    </li>
                    <li>
                      <span className="font-medium text-purple-600">Test without fear:</span> generating 10–15 options
                      is as easy as generating one.
                    </li>
                  </ul>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => router.push('/generate')}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-purple-600 text-white text-sm font-medium shadow-md hover:bg-purple-700 hover:shadow-lg transition-all"
                    >
                      Open Flowt dashboard
                    </button>
                    <p className="text-xs md:text-sm text-gray-500">
                      Ideal for brands, agencies and solo founders who need to keep testing new ideas.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="rounded-2xl bg-gray-50 border border-dashed border-gray-200 p-4 md:p-5 text-xs md:text-sm text-gray-600">
                    <p className="mb-2 font-medium text-gray-800">Example workflow</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Describe your product or upload a reference image on the home page.</li>
                      <li>Flowt generates a batch of ad-ready creatives in the dashboard.</li>
                      <li>
                        Click <span className="font-mono bg-gray-100 px-1 rounded">re-edit</span> to refine the prompt,
                        angle or format and regenerate.
                      </li>
                    </ol>
                    <p className="mt-3 text-gray-500">
                      Your entire creative history lives in the Gallery, ready to be reused whenever you launch a new
                      campaign.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </div>

      {/* Configuration Popup - centered like ByteDance */}
      <AnimatePresence>
        {showConfig && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfig(false)}
              className="fixed inset-0 bg-black/20 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="fixed left-1/2 top-[52%] z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Configuration</h2>
                <button
                  onClick={() => setShowConfig(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
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

              {/* Maximum Sheets & Image size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 text-xs font-medium text-gray-500">
                    maximum number of generated sheets
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

                <div>
                  <div className="mb-2 text-xs font-medium text-gray-500">Image size</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}