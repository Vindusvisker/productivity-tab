'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Quote, Heart, Sparkles, RefreshCw, Shuffle } from 'lucide-react'
import { affirmations, type Affirmation } from '@/data/vision'

export default function AffirmationWall() {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(
    // Start at a random affirmation when component loads
    affirmations[Math.floor(Math.random() * affirmations.length)]
  )
  const [isTransitioning, setIsTransitioning] = useState(false)

  const nextAffirmation = useCallback(() => {
    if (isTransitioning || affirmations.length <= 1) return
    
    setIsTransitioning(true)
    
    setTimeout(() => {
      const currentIndex = affirmations.findIndex(aff => aff.id === currentAffirmation.id)
      const nextIndex = (currentIndex + 1) % affirmations.length
      setCurrentAffirmation(affirmations[nextIndex])
      
      setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
    }, 300)
  }, [isTransitioning, currentAffirmation.id])

  useEffect(() => {
    // Auto-rotate affirmations every 7 seconds for dynamic experience
    const interval = setInterval(() => {
      nextAffirmation()
    }, 7000)

    return () => clearInterval(interval)
  }, [nextAffirmation])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'money': return '💰'
      case 'health': return '💪'
      case 'freedom': return '🗽'
      case 'success': return '🏆'
      case 'habits': return '🎯'
      case 'motivation': return '⚡'
      default: return '✨'
    }
  }

  return (
    <Card className="bg-gradient-to-br from-black/40 via-black/30 to-black/40 border border-white/10 backdrop-blur-xl overflow-hidden rounded-3xl shadow-xl shadow-black/20 transition-all duration-500 hover:shadow-2xl group"
          style={{ minHeight: '240px' }}>
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <CardContent className="p-5 flex flex-col relative z-10 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Affirmations</h2>
              <p className="text-xs text-purple-300">Daily motivation</p>
            </div>
          </div>
        </div>

        {/* Main Affirmation Display - Compact */}
        <div className="flex-1 flex flex-col justify-center items-center relative">
          <div className={`transition-all duration-700 text-center w-full ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
            
            {/* Decorative Quote Marks */}
            <div className="flex justify-center mb-3">
              <div className="flex items-center space-x-4">
                <Quote className="h-6 w-6 text-white/20 transform rotate-180" />
                <div className="w-12 h-0.5 bg-gradient-to-r from-white/60 via-white/80 to-white/60"></div>
                <Quote className="h-6 w-6 text-white/20" />
              </div>
            </div>

            {/* Affirmation Text - Compact */}
            <div className="mb-4 px-2">
              <blockquote className="text-lg lg:text-xl font-bold text-white leading-relaxed mb-3 max-w-xl mx-auto">
                "{currentAffirmation.text}"
              </blockquote>

              {/* Author */}
              {currentAffirmation.author && (
                <div className="text-center text-white/60 text-sm italic">
                  — {currentAffirmation.author}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 