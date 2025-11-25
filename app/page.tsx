'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, SyntheticEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Upload, X } from 'lucide-react'

const sparkIdeas = [
  {
    id: 'commercial',
    label: 'Professional solution',
    highlight: 'Commercial Photography for Your Brand',
    description:
      'Transform your product photography with AI-powered commercial-grade shots that drive sales. Perfect for e-commerce, social media, and marketing campaigns that convert browsers into buyers.',
    badge: 'Bestseller',
    capabilities: ['Brand consistency', 'Studio lighting', 'Multi-angle shots', 'Background removal', 'Color grading'],
    gallery: [
      { id: 'commercial-1', title: 'Product hero shot', image: '/assets/marketing/commercial-thumb-1.jpg' },
      { id: 'commercial-2', title: 'Lifestyle integration', image: '/assets/marketing/commercial-thumb-2.jpg' },
      { id: 'commercial-3', title: 'Social media ready', image: '/assets/marketing/commercial-thumb-3.jpg' },
    ],
    primary: {
      image: '/assets/marketing/commercial-main.jpg',
      caption:
        'Professional commercial photography that showcases your products in the best light. Our AI understands lighting, composition, and brand aesthetics to create images that increase conversion rates by up to 300%.',
      cta: 'Start creating assets',
    },
  },
  {
    id: 'brand-voice',
    label: 'Brand identity',
    highlight: 'Create Your Brand Voice',
    description:
      'Develop a consistent visual language that speaks your brand\'s story. From product shots to social content, maintain perfect brand identity across all your marketing touchpoints.',
    badge: 'Brand essential',
    capabilities: ['Visual consistency', 'Brand guidelines', 'Multi-platform ready', 'Scalable content', 'Style memory'],
    gallery: [
      { id: 'brand-1', title: 'Brand aesthetic', image: '/assets/marketing/brand-thumb-1.jpg' },
      { id: 'brand-2', title: 'Social series', image: '/assets/marketing/brand-thumb-2.jpg' },
      { id: 'brand-3', title: 'Campaign look', image: '/assets/marketing/brand-thumb-3.jpg' },
    ],
    primary: {
      image: '/assets/marketing/brand-main.jpg',
      caption:
        'Your brand deserves consistency. Our AI learns your visual identity and creates content that maintains perfect brand recognition across all platforms, increasing brand recall by 80%.',
      cta: 'Create brand identity',
    },
  },
  {
    id: 'poster',
    label: 'Creative design',
    highlight: 'Poster',
    description:
      'Prototype theatrical posters, festival art and launch hero shots with neon-level detail and brand-safe typography controls.',
    badge: 'Batch ready',
    capabilities: ['Style transfer', 'Feature consistency', 'High-res 4K'],
    slideshow: [
      '/assets/marketing/poster-main.jpg',
      '/assets/marketing/poster-slide-1.jpg',
      '/assets/marketing/poster-slide-2.jpg',
    ],
    primary: {
      image: '/assets/marketing/poster-main.jpg',
      caption: 'Blend fashion, product and cinematic energy in a single prompt to get studio-grade hero art.',
      cta: 'Experience now',
    },
  },
]

const companyLogos = [
  { id: 1, logo: '/assets/logos/logo1.png' },
  { id: 2, logo: '/assets/logos/logo2.png' },
  { id: 3, logo: '/assets/logos/logo3.png' },
  { id: 4, logo: '/assets/logos/logo4.png' },
  { id: 5, logo: '/assets/logos/logo5.png' },
  { id: 6, logo: '/assets/logos/logo6.png' },
  { id: 7, logo: '/assets/logos/logo7.png' },
  { id: 8, logo: '/assets/logos/logo8.png' },
  { id: 9, logo: '/assets/logos/logo9.png' },
  { id: 10, logo: '/assets/logos/logo10.png' },
]

const capabilityTabs = [
  {
    id: 'multi-blend',
    title: 'Multi-image blending',
    description: 'Combine multiple references with perfect consistency. Our AI preserves textures, lighting, and brand elements across all compositions.',
    bullets: ['Blend products with lifestyle scenes', 'Maintain brand colors automatically', 'Create cohesive campaign sets'],
    inputImage: '/assets/marketing/capability-multi-input.jpg',
    outputImage: '/assets/marketing/capability-multi-output.jpg',
  },
  {
    id: 'batch-generation',
    title: 'Batch generation',
    description: 'Generate multiple variations instantly. Create entire campaigns with consistent styling and lighting across all assets.',
    bullets: ['One-to-many generation', 'Style consistency across batches', 'Bulk export in all formats'],
    inputImage: '/assets/marketing/capability-batch-input.jpg',
    outputImage: '/assets/marketing/capability-batch-output.jpg',
    outputSlideshow: [
      '/assets/marketing/capability-batch-output-1.jpg',
      '/assets/marketing/capability-batch-output-2.jpg',
      '/assets/marketing/capability-batch-output-3.jpg',
      '/assets/marketing/capability-batch-output-4.jpg',
    ],
  },
  {
    id: 'style-transfer',
    title: 'Advanced style transfer',
    description: 'Apply any visual style while maintaining product recognition. From minimalist to luxury, match any brand aesthetic instantly.',
    bullets: ['150+ pre-built styles', 'Custom style training', 'Preserve product details'],
    inputImage: '/assets/marketing/capability-style-input.jpg',
    outputImage: '/assets/marketing/capability-style-output.jpg',
  },
  {
    id: 'background-magic',
    title: 'Background generation',
    description: 'Create perfect backgrounds that complement your products. Studio, lifestyle, or abstract - all with perfect lighting.',
    bullets: ['AI-powered lighting matching', 'Seasonal background packs', 'Infinite variations'],
    inputImage: '/assets/marketing/capability-bg-input.jpg',
    outputImage: '/assets/marketing/capability-bg-output.jpg',
  },
  {
    id: 'color-harmony',
    title: 'Color harmony engine',
    description: 'Ensure perfect color consistency across all your visuals. Match brand guidelines or create complementary palettes automatically.',
    bullets: ['Brand color palette import', 'Automatic color correction', 'Seasonal color adaptation'],
    inputImage: '/assets/marketing/capability-color-input.jpg',
    outputImage: '/assets/marketing/capability-color-output.jpg',
  },
]

const beforeAfterSets = [
  {
    id: 'product-transformation',
    title: 'Product Photography Transformation',
    description: 'Transform basic product shots into professional commercial photography that drives sales.',
    inputImage: '/assets/marketing/beforeafter-1-input.jpg',
    outputImage: '/assets/marketing/beforeafter-1-output.jpg',
  },
  {
    id: 'brand-enhancement',
    title: 'Brand Style Enhancement',
    description: 'Apply consistent brand styling across all your marketing visuals for maximum impact.',
    inputImage: '/assets/marketing/beforeafter-2-input.jpg',
    outputImage: '/assets/marketing/beforeafter-2-output.jpg',
  },
]

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const capabilityRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(2)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState('hero')
  const [prompt, setPrompt] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [posterSlideIndex, setPosterSlideIndex] = useState(0)
  const [batchSlideIndex, setBatchSlideIndex] = useState(0)
  const [logoSlideIndex, setLogoSlideIndex] = useState(0)
  const [config, setConfig] = useState({
    mode: 'Auto mode',
    resolution: '2K',
    ratio: '1:1',
    count: 15,
    credits: 15,
  })
  const [activeCapability, setActiveCapability] = useState(capabilityTabs[0].id)
  const [showPricingNudge, setShowPricingNudge] = useState(false)
  const router = useRouter()
  const activeCapabilityContent = capabilityTabs.find((cap) => cap.id === activeCapability) ?? capabilityTabs[0]

  const buildPlaceholder = (label: string) =>
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='600' height='400' rx='32' fill='#f5f5f7'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#94a3b8' font-size='20' font-family='Inter, Arial, sans-serif'>${label}</text></svg>`
    )}`

  const handleImageFallback = (event: SyntheticEvent<HTMLImageElement>, label: string) => {
    const target = event.currentTarget
    if (target.dataset.fallbackApplied) return
    target.dataset.fallbackApplied = 'true'
    target.src = buildPlaceholder(label)
  }

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
      image: '/assets/flowt/carousel-poster.jpg',
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
      image: '/assets/flowt/carousel-storybook.jpg',
      label: 'On-brand visuals for every stage of the funnel.',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [cards.length])

  useEffect(() => {
    const posterIdea = sparkIdeas.find(idea => idea.id === 'poster')
    if (posterIdea?.slideshow) {
      const interval = setInterval(() => {
        setPosterSlideIndex((prev) => (prev + 1) % posterIdea.slideshow!.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (activeCapability === 'batch-generation') {
      const batchCapability = capabilityTabs.find(cap => cap.id === 'batch-generation')
      if (batchCapability?.outputSlideshow) {
        const interval = setInterval(() => {
          setBatchSlideIndex((prev) => (prev + 1) % batchCapability.outputSlideshow!.length)
        }, 2500)
        return () => clearInterval(interval)
      }
    }
  }, [activeCapability])

  useEffect(() => {
    const interval = setInterval(() => {
      setLogoSlideIndex((prev) => (prev + 1) % companyLogos.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [companyLogos.length])

  const handleGenerate = () => {
    if (!prompt.trim()) return
    
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/me')
        if (res.status === 401) {
          // Redirect to sign-in with prompt and credits message
          router.push(`/signin?prompt=${encodeURIComponent(prompt)}`)
          return
        }
        // User is authenticated, proceed to generate
        router.push(`/generate?prompt=${encodeURIComponent(prompt)}`)
      } catch (error) {
        // Assume not authenticated, redirect to sign-in
        router.push(`/signin?prompt=${encodeURIComponent(prompt)}`)
      }
    }
    
    checkAuth()
  }

  const handlePromptSubmit = () => {
    if (!prompt.trim()) return
    if (pricingRef.current) {
      pricingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setShowPricingNudge(true)
  }

  const handleSelectPlan = async (planId: string) => {
    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, currency: 'USD' }),
      })

      if (!res.ok) {
        console.error('Failed to start subscription', await res.text())
        return
      }

      const data = await res.json()
      const keyId = data.razorpay?.keyId

      if (typeof window !== 'undefined' && (window as any).Razorpay && keyId && data.razorpay?.subscription) {
        const options = {
          key: keyId,
          subscription_id: data.razorpay.subscription.id,
          name: 'Flowt',
          description: `${planId} subscription`,
          notes: {
            flowt_plan: planId,
          },
          prefill: {
            name: data.razorpay.user?.name || undefined,
            email: data.razorpay.user?.email || undefined,
          },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
    } catch (error) {
      console.error('Error starting subscription', error)
    }
  }

  const handleGoDashboard = () => {
    if (prompt.trim()) {
      router.push(`/generate?prompt=${encodeURIComponent(prompt)}`)
    } else {
      router.push('/generate')
    }
  }

  // Scroll navigation functions
  const handleGoHero = () => {
    if (heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleGoCapability = () => {
    if (capabilityRef.current) {
      capabilityRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Pricing navigation - single definition only
  const handleGoPricing = () => {
    if (pricingRef.current) {
      pricingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Scroll detection to update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      if (heroRef.current && scrollPosition < heroRef.current.offsetTop + heroRef.current.offsetHeight) {
        setActiveSection('hero')
      } else if (capabilityRef.current && scrollPosition < capabilityRef.current.offsetTop + capabilityRef.current.offsetHeight) {
        setActiveSection('capability')
      } else if (pricingRef.current) {
        setActiveSection('pricing')
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const sections = [
    { id: 'hero', label: 'Home', ref: heroRef, handler: handleGoHero },
    { id: 'capability', label: 'Features', ref: capabilityRef, handler: handleGoCapability },
    { id: 'pricing', label: 'Pricing', ref: pricingRef, handler: handleGoPricing },
  ]

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
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={handleGoCapability}
            >
              Examples
            </button>
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={handleGoPricing}
            >
              Pricing
            </button>
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
        ref={heroRef}
        className="pt-24 pb-12 min-h-screen bg-white relative"
      >
        {/* Scroll Indicators */}
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={section.handler}
              className={`group relative w-3 h-3 rounded-full transition-all duration-300 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={section.label}
            >
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {section.label}
              </div>
            </button>
          ))}
        </div>
        {/* HERO + CAROUSEL + CHATBOT (kept inside scaled container) */}
        <div
          className="relative origin-top mx-auto"
          style={{
            transform: 'scale(0.72)',
            maxWidth: '1240px',
          }}
        >

          {/* Hero Title */}
          <div className="relative max-w-4xl mx-auto text-center mb-12 px-6">
            {/* Dotted background with circular fade from corners */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 -mx-8 -my-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: `
                  radial-gradient(ellipse at center, 
                    rgba(59,130,246,0.6) 1px, transparent 1px,
                    rgba(139,92,246,0.1) 1px, transparent 1px,
                    rgba(236,72,153,0.5) 1px, transparent 1px,
                    rgba(59,130,246,0.15) 1px, transparent 1px,
                    rgba(139,92,246,0.4) 1px, transparent 1px,
                    rgba(236,72,153,0.25) 1px, transparent 1px
                  ),
                  radial-gradient(circle at center, transparent 30%, rgba(255,255,255,0.9) 70%)
                `,
                backgroundSize: '25px 25px, 100% 100%',
                backgroundPosition: '0 0, 0 0',
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
              }}
            />
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[36px] md:text-[46px] lg:text-[54px] font-semibold tracking-tight text-gray-900 mb-3"
            >
              <span>Flowt </span>
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                2.0
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-[10px] md:text-xs font-medium uppercase tracking-[0.25em] text-gray-500 mb-3"
            >
              Commercial photography engine
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Generate studio-grade commercial product photography for brands, performance teams and creators.
              Flowt 2.0 turns one prompt and a single product image into up to 15 4K shots across multiple aspect
              ratios – all downloadable in a single pass.
            </motion.p>
          </div>

          {/* 3D CAROUSEL */}
          <div
            className="relative h-[300px] md:h-[340px] flex items-center justify-center mb-6"
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
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-gray-100">
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
            className="max-w-5xl mx-auto px-4 md:px-6 mt-6"
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
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === 'Return') && !e.shiftKey) {
                          e.preventDefault()
                          handlePromptSubmit()
                        }
                      }}
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
                  onClick={handlePromptSubmit}
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
              Flowt 2.0 transforms your creative vision into stunning campaigns. Describe your brand, watch the magic happen, and iterate endlessly until it's perfect.
            </div>
          </motion.div>
        </div>

        {/* MARKETING SECTIONS – FULL WIDTH */}
        <div className="max-w-6xl mx-auto px-6 pb-16 space-y-14 mt-1">
          {/* Showcase intro (performance section) */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto space-y-3"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Flowt 2.0 for growth teams</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
                A creative surface built for performance marketing
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                Flowt 2.0 turns a single brief into test-ready campaigns for D2C brands, teams and creators. Clean
                layouts, consistent imagery and copy that feels native to your product pages and ad accounts.
              </p>
              </motion.div>
          </section>

          {/* Spark ideas for D2C brands */}
          <section className="space-y-10">
            {sparkIdeas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="rounded-3xl bg-white border border-gray-200 shadow-sm p-6 md:p-9 overflow-hidden"
              >
                <div className={`flex flex-col gap-10 ${idea.id === 'poster' ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                  <div className={`${idea.id === 'poster' ? 'lg:w-1/2' : 'lg:w-2/5'} space-y-4`}>
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-500">{idea.label}</p>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-semibold text-gray-900">
                        {idea.highlight}
                      </h3>
                      <p className="mt-3 text-sm md:text-base text-gray-600">
                        {idea.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-800">
                      <div className="px-3 py-1.5 rounded-2xl border border-gray-200 bg-gray-50 font-medium">
                        <span className="text-gray-500 font-normal">{idea.badge}</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-700">
                        Powered by Flowt 2.0
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {idea.capabilities.map((capability) => (
                        <span
                          key={capability}
                          className="px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-800"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={`${idea.id === 'poster' ? 'lg:w-1/2' : 'lg:w-3/5'} space-y-6`}>
                    {idea.id === 'poster' && idea.slideshow ? (
                      <div className="rounded-2xl border border-gray-200 bg-gray-50/80 shadow-inner overflow-hidden">
                        <div className="relative h-80 sm:h-96 bg-gray-100">
                          {idea.slideshow.map((slide, index) => (
                            <img
                              key={index}
                              src={slide}
                              alt={`Poster slide ${index + 1}`}
                              className={`w-full h-full object-cover transition-opacity duration-1000 ${index === posterSlideIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                              onError={(event) => handleImageFallback(event, `Poster slide ${index + 1}`)}
                            />
                          ))}
                          <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.25em] bg-black/70 text-white px-3 py-1.5 rounded-full">
                            {idea.highlight}
                          </span>
                          <button className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-sm font-medium text-gray-900 shadow-md border border-gray-200/60">
                            {idea.primary.cta}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          {/* Slideshow indicators */}
                          <div className="absolute bottom-4 left-4 flex gap-2">
                            {idea.slideshow.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setPosterSlideIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${index === posterSlideIndex ? 'bg-white' : 'bg-white/50'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-between bg-white/80">
                          <p className="text-sm md:text-base text-gray-700 leading-relaxed">{idea.primary.caption}</p>
                          <p className="text-xs text-gray-500 mt-6">
                            Flowt 2.0 keeps framing, tone and lighting consistent so your ads feel like one system from
                            feed to landing page.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`grid gap-4 ${idea.id === 'poster' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>
                          {idea.gallery?.map((card) => (
                            <div
                              key={card.id}
                              className="rounded-2xl bg-gray-50 border border-gray-100 p-3 flex flex-col"
                            >
                              <div className={`${idea.id === 'poster' ? 'h-56 sm:h-64' : 'h-32 sm:h-36'} rounded-xl overflow-hidden bg-slate-100`}>
                                <img
                                  src={card.image}
                                  alt={card.title}
                                  className="w-full h-full object-cover"
                                  onError={(event) => handleImageFallback(event, card.title)}
                                />
                              </div>
                              <p className="mt-3 text-xs font-medium text-gray-700">{card.title}</p>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-gray-50/80 shadow-inner overflow-hidden">
                          <div className="grid md:grid-cols-2">
                            <div className="relative h-64 md:h-72 bg-gray-100">
                              <img
                                src={idea.primary.image}
                                alt={`${idea.highlight} primary`}
                                className="w-full h-full object-cover"
                                onError={(event) => handleImageFallback(event, idea.highlight)}
                              />
                              <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.25em] bg-black/70 text-white px-3 py-1.5 rounded-full">
                                {idea.highlight}
                              </span>
                              <button className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-sm font-medium text-gray-900 shadow-md border border-gray-200/60">
                                {idea.primary.cta}
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="p-6 md:p-8 flex flex-col justify-between bg-white/80">
                              <p className="text-sm md:text-base text-gray-700 leading-relaxed">{idea.primary.caption}</p>
                              <p className="text-xs text-gray-500 mt-6">
                                Flowt 2.0 keeps framing, tone and lighting consistent so your ads feel like one system from
                                feed to landing page.
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Capability tabs */}
          <section ref={capabilityRef}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
              className="rounded-[32px] bg-white/95 border border-gray-100 shadow-lg p-6 md:p-10"
            >
              <div className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Capabilities</p>
                    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">What Flowt 2.0 handles for you</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {capabilityTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveCapability(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          activeCapability === tab.id
                            ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-purple-200'
                        }`}
                      >
                        {tab.title}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-sm md:text-base text-gray-600 max-w-3xl">
                  {activeCapabilityContent.description}
                </p>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                  {activeCapabilityContent.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative rounded-3xl border border-gray-100 bg-gray-50 overflow-hidden shadow-inner p-5 flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-3">Input image</span>
                    <div className="h-80 rounded-2xl overflow-hidden bg-gray-100">
                      <img
                        src={activeCapabilityContent.inputImage}
                        alt={`${activeCapabilityContent.title} input`}
                        className="w-full h-full object-cover"
                        onError={(event) => handleImageFallback(event, `${activeCapabilityContent.title} input`)}
                      />
                    </div>
                    <p className="mt-4 text-xs text-gray-600">
                      Drop in a product photo or reference shot. Flowt 2.0 keeps proportions, materials and camera feel.
                    </p>
                  </div>
                  <div className="relative rounded-3xl border border-gray-100 bg-gray-50 overflow-hidden shadow-inner p-5 flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-3">Output image</span>
                    <div className="h-80 rounded-2xl overflow-hidden bg-gray-100">
                      {activeCapability === 'batch-generation' && 'outputSlideshow' in activeCapabilityContent && activeCapabilityContent.outputSlideshow ? (
                        <>
                          {activeCapabilityContent.outputSlideshow.map((slide, index) => (
                            <img
                              key={index}
                              src={slide}
                              alt={`Batch output ${index + 1}`}
                              className={`w-full h-full object-cover transition-opacity duration-1000 ${index === batchSlideIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                              onError={(event) => handleImageFallback(event, `Batch output ${index + 1}`)}
                            />
                          ))}
                          {/* Slideshow indicators */}
                          <div className="absolute bottom-4 left-4 flex gap-2">
                            {'outputSlideshow' in activeCapabilityContent && activeCapabilityContent.outputSlideshow?.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setBatchSlideIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${index === batchSlideIndex ? 'bg-white' : 'bg-white/50'}`}
                              />
                            ))}
                          </div>
                        </>
                      ) : (
                        <img
                          src={activeCapabilityContent.outputImage}
                          alt={`${activeCapabilityContent.title} output`}
                          className="w-full h-full object-cover"
                          onError={(event) => handleImageFallback(event, `${activeCapabilityContent.title} output`)}
                        />
                      )}
                    </div>
                    <p className="mt-4 text-xs text-gray-600">
                      {activeCapability === 'batch-generation' 
                        ? 'Generate multiple variations instantly. Create entire campaigns with consistent styling and lighting across all assets.'
                        : 'Get ad-ready visuals that match your brief and slot straight into paid campaigns and PDPs.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          <div className="space-y-20 pt-12 border-t border-gray-100">
            {/* Companies section */}
            <section>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="rounded-3xl bg-white/90 border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="px-6 py-8 md:px-10 md:py-12 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-purple-500 mb-2">TRUSTED BY</p>
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                    Leading Companies Choose Flowt 2.0
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-8">
                    Join thousands of creative teams using our AI to generate stunning visuals at scale
                  </p>
                  
                  {/* Logo Carousel */}
                  <div className="relative overflow-hidden py-8">
                    <div className="flex animate-scroll">
                      {/* First set of logos */}
                      {companyLogos.slice(1, -1).map((company, index) => (
                        <div
                          key={`first-${company.id}`}
                          className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center mx-3 md:mx-4 shadow-sm"
                        >
                          <img
                            src={company.logo}
                            alt={`Logo ${index + 2}`}
                            className="w-full h-full object-contain p-3"
                            onError={(event) => handleImageFallback(event, `Logo ${index + 2}`)}
                          />
                        </div>
                      ))}
                      {/* Duplicate set for seamless scrolling */}
                      {companyLogos.slice(1, -1).map((company, index) => (
                        <div
                          key={`second-${company.id}`}
                          className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center mx-3 md:mx-4 shadow-sm"
                        >
                          <img
                            src={company.logo}
                            alt={`Logo ${index + 2}`}
                            className="w-full h-full object-contain p-3"
                            onError={(event) => handleImageFallback(event, `Logo ${index + 2}`)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

          {/* Pricing section (scroll target) placed between formats + performance */}
          <section ref={pricingRef} className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
              className="rounded-[32px] bg-white border border-gray-200 shadow-sm p-6 md:p-10"
            >
              <div className="mb-10 text-center space-y-3">
                <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Flowt 2.0 pricing</p>
                <h2 className="mt-3 text-3xl md:text-[34px] font-semibold tracking-tight text-gray-900">
                  Choose the plan that fits your creative runway
                </h2>
                <p className="mt-4 text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Every paid plan unlocks Ultra HD and 4K generations. Start with a few winning creatives, then scale to
                  thousands of on-brand assets without booking another studio day.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50/70 px-3 py-1 text-[11px] font-medium text-purple-700 justify-center mx-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>
                    Pick a plan to unlock full image generation. For a live demo, email{' '}
                    <a
                      href="mailto:contact@useflowt.com"
                      className="text-purple-700 underline underline-offset-2"
                    >
                      contact@useflowt.com
                    </a>{' '}
                    and we’ll get back to you within 24 hours.
                  </span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    id: 'FREE',
                    name: 'Free',
                    description: '15 AI images to start creating amazing content today.',
                    price: 0,
                    credits: 15,
                  },
                  {
                    id: 'BASIC',
                    name: 'Basic',
                    description: '120 Ultra HD images per month for early-stage testing and lean teams.',
                    price: 20,
                    credits: 120,
                  },
                  {
                    id: 'ENHANCED',
                    name: 'Enhanced',
                    description: '400 Ultra HD images per month for growth teams running constant experiments.',
                    price: 49,
                    credits: 400,
                  },
                  {
                    id: 'PREMIUM',
                    name: 'Premium',
                    description: '1100 Ultra HD images per month for brands shipping new campaigns every week.',
                    price: 99,
                    credits: 1100,
                    popular: true,
                  },
                ].map((plan) => (
                  <div
                    key={plan.id}
                    className="flex flex-col rounded-3xl border border-gray-200 bg-white shadow-sm p-5 md:p-6"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      {plan.id === 'PREMIUM' && (
                        <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                          Most popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-5 min-h-[44px] leading-relaxed">{plan.description}</p>

                    {plan.price !== null ? (
                      <div className="mb-5 space-y-1 text-sm">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-semibold tracking-tight text-gray-900">
                            {plan.price === 0 ? 'Free' : `$${plan.price}`}
                          </span>
                          <span className="text-xs text-gray-500">
                            {plan.price === 0 ? 'forever' : 'USD / month'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-5 text-sm font-semibold text-gray-900">Talk to us for pricing</div>
                    )}

                    <div className="mb-4 text-xs text-gray-600 space-y-1">
                      <p className="font-medium text-gray-800">What you get</p>
                      <p>
                        {plan.credits > 0
                          ? `${plan.credits} Ultra HD images per month, with 4K resolution available on every generation.`
                          : 'Dedicated workspace, team accounts, custom SLAs, API access, onboarding, and an account manager.'}
                      </p>
                    </div>

                    <div className="mt-auto pt-2">
                      {plan.id === 'FREE' ? (
                        <button
                          onClick={() => router.push('/generate')}
                          className="w-full rounded-full bg-purple-600 text-white py-2.5 text-sm font-medium hover:bg-purple-700 transition-colors"
                        >
                          Start generating for free
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSelectPlan(plan.id)}
                          className="w-full rounded-full bg-gray-900 text-white py-2.5 text-sm font-medium hover:bg-black transition-colors"
                        >
                          Start {plan.name.toLowerCase()} plan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 text-center text-xs text-gray-500">
                Dedicated plans include team accounts, custom SLAs, API access, onboarding, and an account manager.
                Pricing is tailored by region and volume.
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

              {/* Maximum images & Image size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <div className="mb-2 text-xs font-medium text-gray-500">
                    Maximum generated images
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={config.count}
                      onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) })}
                      className="w-full max-w-[160px]"
                    />
                    <input
                      type="number"
                      value={config.count}
                      onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) })}
                      className="w-14 px-2 py-1 border rounded text-center text-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-medium text-gray-500">Image size</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span>W</span>
                    <input
                      type="number"
                      defaultValue="2048"
                      className="w-20 px-2 py-1 border rounded"
                    />
                    <span className="text-gray-400">
                      ⇄
                    </span>
                    <span>H</span>
                    <input
                      type="number"
                      defaultValue="2048"
                      className="w-20 px-2 py-1 border rounded"
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
