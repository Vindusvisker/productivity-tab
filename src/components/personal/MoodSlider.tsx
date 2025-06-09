'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import './MoodSlider.css'

interface MoodSliderProps {
  initialValue?: number
  onComplete: (data: { mood: number, feelingTags: string[], contextTags: string[] }) => void
  onSkip?: () => void
}

const MOOD_LABELS = [
  'Very Unpleasant',
  'Unpleasant', 
  'Slightly Unpleasant',
  'Neutral',
  'Slightly Pleasant',
  'Pleasant',
  'Very Pleasant'
]

const MOOD_COLORS = [
  { bg: 'from-red-500 to-red-600', blob: 'fill-red-400' },
  { bg: 'from-orange-500 to-red-500', blob: 'fill-orange-400' },
  { bg: 'from-yellow-500 to-orange-500', blob: 'fill-yellow-400' },
  { bg: 'from-blue-400 to-blue-500', blob: 'fill-blue-400' },
  { bg: 'from-green-400 to-blue-400', blob: 'fill-green-400' },
  { bg: 'from-green-500 to-green-400', blob: 'fill-green-500' },
  { bg: 'from-emerald-500 to-green-500', blob: 'fill-emerald-400' }
]

// Apple Health-style feeling tags
const FEELING_TAGS = [
  'Fantastic', 'Excited', 'Surprised', 'Engaged', 'Happy', 'Lucky', 'Brave',
  'Proud', 'Confident', 'Hopeful', 'Calm', 'Peaceful', 'Relieved', 'Grateful',
  'Content', 'Satisfied', 'Amused', 'Playful', 'Curious', 'Inspired', 'Creative',
  'Energetic', 'Focused', 'Determined', 'Accomplished'
]

// Context/impact tags  
const CONTEXT_TAGS = [
  'Health', 'Exercise', 'Self-care', 'Hobbies', 'Identity', 'Spirituality',
  'Community', 'Family', 'Friends', 'Partner', 'Dating', 'Goals', 'Work', 
  'Education', 'Travel', 'Weather', 'News', 'Money', 'Achievements', 'Challenges'
]

type FlowStep = 'mood' | 'feeling' | 'context' | 'complete'

export default function MoodSlider({ initialValue = 3, onComplete, onSkip }: MoodSliderProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('mood')
  const [moodValue, setMoodValue] = useState(initialValue)
  const [selectedFeelingTags, setSelectedFeelingTags] = useState<string[]>([])
  const [selectedContextTags, setSelectedContextTags] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  const handleSliderChange = (newValue: number) => {
    setIsAnimating(true)
    setMoodValue(newValue)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleMoodNext = () => {
    setCurrentStep('feeling')
  }

  const handleFeelingNext = () => {
    setCurrentStep('context')
  }

  const handleContextNext = () => {
    setCurrentStep('complete')
    setTimeout(() => {
      onComplete({
        mood: moodValue,
        feelingTags: selectedFeelingTags,
        contextTags: selectedContextTags
      })
    }, 2000) // Show completion for 2 seconds
  }

  const toggleFeelingTag = (tag: string) => {
    setSelectedFeelingTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const toggleContextTag = (tag: string) => {
    setSelectedContextTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const currentMood = MOOD_COLORS[moodValue] || MOOD_COLORS[3]
  const currentLabel = MOOD_LABELS[moodValue] || MOOD_LABELS[3]

  // Create blob path that changes based on mood value
  const getBlobPath = (moodValue: number) => {
    const intensity = moodValue / 6 // 0-1 scale
    const baseRadius = 80
    const variation = 20 + (intensity * 15) // More variation for higher moods
    
    // Create organic blob shape
    const points = []
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = baseRadius + Math.sin(angle * 3 + moodValue) * variation
      const x = 150 + Math.cos(angle) * radius
      const y = 150 + Math.sin(angle) * radius
      points.push([x, y])
    }
    
    // Create smooth curved path
    let path = `M ${points[0][0]} ${points[0][1]}`
    for (let i = 0; i < points.length; i++) {
      const nextIndex = (i + 1) % points.length
      const cpx = (points[i][0] + points[nextIndex][0]) / 2
      const cpy = (points[i][1] + points[nextIndex][1]) / 2
      path += ` Q ${points[i][0]} ${points[i][1]} ${cpx} ${cpy}`
    }
    path += ' Z'
    
    return path
  }

  // Completion screen
  if (currentStep === 'complete') {
    return (
      <div className="h-full bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-white text-3xl font-light">Logged</h2>
        </div>
      </div>
    )
  }

  // Feeling tags selection
  if (currentStep === 'feeling') {
    return (
      <div className={`h-full bg-gradient-to-br ${currentMood.bg} flex flex-col transition-all duration-500`}>
        <div className="flex items-center justify-between p-4 pt-8">
          <button 
            onClick={() => setCurrentStep('mood')}
            className="text-white/80 hover:text-white text-base"
          >
            Back
          </button>
          <h1 className="text-white font-medium text-base">Feeling</h1>
          <button 
            onClick={onSkip}
            className="text-white/80 hover:text-white text-base"
          >
            Cancel
          </button>
        </div>

        <div className="flex-1 flex flex-col px-4 overflow-y-auto">
          {/* Mood blob - smaller */}
          <div className="flex justify-center mb-4">
            <svg width="80" height="80" viewBox="0 0 300 300" className="scale-50">
              <path
                d={getBlobPath(moodValue)}
                className={`${currentMood.blob} opacity-80`}
              />
            </svg>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-white text-xl font-medium">{currentLabel}</h2>
            {selectedFeelingTags.length > 0 && (
              <p className="text-white/70 text-xs mt-1">{selectedFeelingTags.slice(0, 3).join(', ')}{selectedFeelingTags.length > 3 ? '...' : ''}</p>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-white text-sm font-medium mb-4 flex items-center">
              What describes the feeling best?
              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center ml-2">
                <span className="text-white text-xs">i</span>
              </div>
            </h3>

            <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
              {FEELING_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleFeelingTag(tag)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    selectedFeelingTags.includes(tag)
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pb-8">
            <Button
              onClick={handleFeelingNext}
              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white py-3 rounded-2xl text-base font-medium"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Context tags selection
  if (currentStep === 'context') {
    return (
      <div className={`h-full bg-gradient-to-br ${currentMood.bg} flex flex-col transition-all duration-500`}>
        <div className="flex items-center justify-between p-4 pt-8">
          <button 
            onClick={() => setCurrentStep('feeling')}
            className="text-white/80 hover:text-white text-base"
          >
            Back
          </button>
          <h1 className="text-white font-medium text-base">Context</h1>
          <button 
            onClick={onSkip}
            className="text-white/80 hover:text-white text-base"
          >
            Cancel
          </button>
        </div>

        <div className="flex-1 flex flex-col px-4 overflow-y-auto">
          {/* Mood blob - smaller */}
          <div className="flex justify-center mb-4">
            <svg width="80" height="80" viewBox="0 0 300 300" className="scale-50">
              <path
                d={getBlobPath(moodValue)}
                className={`${currentMood.blob} opacity-80`}
              />
            </svg>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-white text-xl font-medium">{currentLabel}</h2>
            {selectedContextTags.length > 0 && (
              <p className="text-white/70 text-xs mt-1">{selectedContextTags.slice(0, 3).join(', ')}{selectedContextTags.length > 3 ? '...' : ''}</p>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-white text-sm font-medium mb-4 flex items-center">
              What has the biggest impact on you?
              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center ml-2">
                <span className="text-white text-xs">i</span>
              </div>
            </h3>

            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {CONTEXT_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleContextTag(tag)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    selectedContextTags.includes(tag)
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pb-8">
            <Button
              onClick={handleContextNext}
              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white py-3 rounded-2xl text-base font-medium"
            >
              Complete
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Main mood selection screen
  return (
    <div className={`h-full bg-gradient-to-br ${currentMood.bg} flex flex-col transition-all duration-500 ease-out`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-8">
        <button 
          onClick={onSkip}
          className="text-white/80 hover:text-white text-base"
        >
          Skip
        </button>
        <h1 className="text-white font-medium text-base">Emotion</h1>
        <button 
          onClick={onSkip}
          className="text-white/80 hover:text-white text-base"
        >
          Cancel
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-8">
          <h2 className="text-white text-2xl font-light mb-2">
            Choose how you're
          </h2>
          <h2 className="text-white text-2xl font-light">
            feeling right now
          </h2>
        </div>

        {/* Animated Blob */}
        <div className="relative mb-8">
          <svg 
            width="200" 
            height="200" 
            viewBox="0 0 300 300"
            className={`transition-all duration-500 ease-out ${isAnimating ? 'scale-110' : 'scale-100'}`}
          >
            {/* Outer glow layers */}
            <path
              d={getBlobPath(moodValue)}
              className={`${currentMood.blob} opacity-20`}
              transform="scale(1.3) translate(-45, -45)"
            />
            <path
              d={getBlobPath(moodValue)}
              className={`${currentMood.blob} opacity-40`}
              transform="scale(1.15) translate(-22.5, -22.5)"
            />
            
            {/* Main blob */}
            <path
              d={getBlobPath(moodValue)}
              className={`${currentMood.blob} transition-all duration-500 ease-out`}
              style={{
                filter: 'blur(0.5px)',
                transform: `scale(${0.8 + moodValue * 0.05})`,
                transformOrigin: '150px 150px'
              }}
            />
            
            {/* Center highlight */}
            <circle
              cx="150"
              cy="150"
              r={20 + moodValue * 3}
              className="fill-white opacity-30 transition-all duration-500"
            />
          </svg>
        </div>

        {/* Mood Label */}
        <div className="text-center mb-8">
          <h3 className="text-white text-xl font-medium">
            {currentLabel}
          </h3>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-6 pb-8">
        {/* Slider */}
        <div className="mb-6">
          <div className="flex justify-between text-white/70 text-xs mb-3">
            <span>VERY UNPLEASANT</span>
            <span>VERY PLEASANT</span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="0"
              max="6"
              value={moodValue}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className="mood-slider"
            />
          </div>
        </div>

        {/* Next Button */}
        <Button
          onClick={handleMoodNext}
          className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white py-3 rounded-2xl text-base font-medium transition-all duration-200"
        >
          Next
        </Button>
      </div>
    </div>
  )
} 