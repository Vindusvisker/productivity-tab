'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Quote, Heart, Sparkles, RefreshCw, Shuffle } from 'lucide-react'
import { affirmations, type Affirmation } from '@/data/vision'

export default function AffirmationWall() {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(affirmations[0])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [filteredAffirmations, setFilteredAffirmations] = useState<Affirmation[]>(affirmations)

  useEffect(() => {
    // Filter affirmations based on selected category
    const filtered = selectedCategory === 'all' 
      ? affirmations 
      : affirmations.filter(aff => aff.category === selectedCategory)
    
    setFilteredAffirmations(filtered)
    
    // If current affirmation is not in filtered list, pick a new one
    if (!filtered.some(aff => aff.id === currentAffirmation.id)) {
      setCurrentAffirmation(filtered[0] || affirmations[0])
    }
  }, [selectedCategory, currentAffirmation.id])

  useEffect(() => {
    // Auto-rotate affirmations every 15 seconds (longer for reading)
    const interval = setInterval(() => {
      if (filteredAffirmations.length > 1) {
        nextAffirmation()
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [filteredAffirmations])

  const nextAffirmation = () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    setTimeout(() => {
      const currentIndex = filteredAffirmations.findIndex(aff => aff.id === currentAffirmation.id)
      const nextIndex = (currentIndex + 1) % filteredAffirmations.length
      setCurrentAffirmation(filteredAffirmations[nextIndex])
      
      setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
    }, 300)
  }

  const randomAffirmation = () => {
    if (isTransitioning || filteredAffirmations.length <= 1) return
    
    setIsTransitioning(true)
    
    setTimeout(() => {
      let randomIndex
      do {
        randomIndex = Math.floor(Math.random() * filteredAffirmations.length)
      } while (filteredAffirmations[randomIndex].id === currentAffirmation.id && filteredAffirmations.length > 1)
      
      setCurrentAffirmation(filteredAffirmations[randomIndex])
      
      setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
    }, 300)
  }

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'money': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'health': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'freedom': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'success': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'habits': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'motivation': return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const quickCategories = ['all', 'money', 'health', 'freedom', 'motivation']

  return (
    <Card className="bg-black/60 border border-white/10 backdrop-blur-xl overflow-hidden rounded-2xl">
      <CardContent className="p-3 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Affirmations</h2>
              <p className="text-xs text-indigo-300">Daily motivation</p>
            </div>
          </div>
          <Badge className="bg-indigo-500/20 text-indigo-400 px-2 py-1 text-xs border border-indigo-500/30">
            {filteredAffirmations.length}
          </Badge>
        </div>

        {/* Quick Category Filter */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {quickCategories.map(category => (
              <Button
                key={category}
                size="sm"
                variant="outline"
                className={`text-xs px-2 py-1 h-6 ${
                  selectedCategory === category
                    ? 'bg-indigo-500/30 border-indigo-500/50 text-indigo-300'
                    : 'bg-white/5 border-white/20 text-gray-400 hover:bg-white/10'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="mr-1 text-xs">
                  {category === 'all' ? '🌟' : getCategoryIcon(category)}
                </span>
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Affirmation Display - Compact */}
        <div className="flex flex-col justify-center relative">
          <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
            {/* Quote Icon */}
            <div className="text-center mb-2">
              <Quote className="h-6 w-6 text-indigo-400/50 mx-auto" />
            </div>

            {/* Affirmation Text */}
            <div className="text-center mb-3">
              <blockquote className="text-sm lg:text-base font-bold text-white leading-relaxed mb-2 px-2">
                "{currentAffirmation.text}"
              </blockquote>
              
              {/* Category Badge */}
              <div className="flex justify-center">
                <Badge className={`${getCategoryColor(currentAffirmation.category)} px-2 py-1 text-xs flex items-center space-x-1`}>
                  <span>{getCategoryIcon(currentAffirmation.category)}</span>
                  <span>{currentAffirmation.category.toUpperCase()}</span>
                </Badge>
              </div>
            </div>

            {/* Author */}
            {currentAffirmation.author && (
              <div className="text-center text-gray-400 text-xs mb-2">
                — {currentAffirmation.author}
              </div>
            )}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-1 mb-3">
            {filteredAffirmations.slice(0, 5).map((_, index) => {
              const currentIndex = filteredAffirmations.findIndex(aff => aff.id === currentAffirmation.id)
              const isActive = index === currentIndex % 5
              return (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-indigo-400' : 'bg-gray-600'
                  }`}
                />
              )
            })}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-2 pt-2 border-t border-white/10">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/5 border-white/20 text-white hover:bg-white/10 flex items-center space-x-1 text-xs px-2 py-1 h-7"
            onClick={nextAffirmation}
            disabled={isTransitioning || filteredAffirmations.length <= 1}
          >
            <RefreshCw className="h-3 w-3" />
            <span>Next</span>
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="bg-white/5 border-white/20 text-white hover:bg-white/10 flex items-center space-x-1 text-xs px-2 py-1 h-7"
            onClick={randomAffirmation}
            disabled={isTransitioning || filteredAffirmations.length <= 1}
          >
            <Shuffle className="h-3 w-3" />
            <span>Random</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 