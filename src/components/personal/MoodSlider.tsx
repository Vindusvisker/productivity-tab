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

// Color stops for smooth interpolation (0-100 range)
const COLOR_STOPS = [
  { position: 0, bg: [239, 68, 68], blob: [248, 113, 113] },      // red-500, red-400
  { position: 16.67, bg: [249, 115, 22], blob: [251, 146, 60] },  // orange-500, orange-400
  { position: 33.33, bg: [234, 179, 8], blob: [250, 204, 21] },   // yellow-500, yellow-400
  { position: 50, bg: [59, 130, 246], blob: [96, 165, 250] },     // blue-500, blue-400
  { position: 66.67, bg: [34, 197, 94], blob: [74, 222, 128] },   // green-500, green-400
  { position: 83.33, bg: [34, 197, 94], blob: [34, 197, 94] },    // green-500, green-500
  { position: 100, bg: [16, 185, 129], blob: [52, 211, 153] }     // emerald-500, emerald-400
]

// Interpolate between two colors
const interpolateColor = (color1: number[], color2: number[], factor: number): number[] => {
  return [
    Math.round(color1[0] + (color2[0] - color1[0]) * factor),
    Math.round(color1[1] + (color2[1] - color1[1]) * factor),
    Math.round(color1[2] + (color2[2] - color1[2]) * factor)
  ]
}

// Get smooth colors based on slider position (0-100)
const getFluidColors = (sliderValue: number) => {
  // Find the two color stops to interpolate between
  let lowerStop = COLOR_STOPS[0]
  let upperStop = COLOR_STOPS[COLOR_STOPS.length - 1]
  
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (sliderValue >= COLOR_STOPS[i].position && sliderValue <= COLOR_STOPS[i + 1].position) {
      lowerStop = COLOR_STOPS[i]
      upperStop = COLOR_STOPS[i + 1]
      break
    }
  }
  
  // Calculate interpolation factor
  const range = upperStop.position - lowerStop.position
  const factor = range === 0 ? 0 : (sliderValue - lowerStop.position) / range
  
  // Interpolate colors
  const bgColor = interpolateColor(lowerStop.bg, upperStop.bg, factor)
  const blobColor = interpolateColor(lowerStop.blob, upperStop.blob, factor)
  
  return {
    bg: `from-[rgb(${bgColor[0]},${bgColor[1]},${bgColor[2]})] to-[rgb(${Math.round(bgColor[0] * 0.8)},${Math.round(bgColor[1] * 0.8)},${Math.round(bgColor[2] * 0.8)})]`,
    blob: `fill-[rgb(${blobColor[0]},${blobColor[1]},${blobColor[2]})]`
  }
}

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
  const [sliderValue, setSliderValue] = useState(initialValue * 16.67) // Convert 0-6 to 0-100 scale
  const [selectedFeelingTags, setSelectedFeelingTags] = useState<string[]>([])
  const [selectedContextTags, setSelectedContextTags] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Convert continuous slider value (0-100) to mood index (0-6)
  const getMoodFromSlider = (value: number): number => {
    if (value <= 8.33) return 0      // 0-8.33% = Very Unpleasant
    if (value <= 25) return 1        // 8.33-25% = Unpleasant  
    if (value <= 41.67) return 2     // 25-41.67% = Slightly Unpleasant
    if (value <= 58.33) return 3     // 41.67-58.33% = Neutral
    if (value <= 75) return 4        // 58.33-75% = Slightly Pleasant
    if (value <= 91.67) return 5     // 75-91.67% = Pleasant
    return 6                         // 91.67-100% = Very Pleasant
  }

  const currentMoodIndex = getMoodFromSlider(sliderValue)
  const moodValue = currentMoodIndex // For blob generation
  
  // Get fluid colors based on exact slider position
  const fluidColors = getFluidColors(sliderValue)
  const currentMood = fluidColors // Use fluid colors instead of discrete mood colors

  const handleSliderChange = (newValue: number) => {
    setIsAnimating(true)
    setSliderValue(newValue)
    
    // Trigger container animation only on mood change, not every pixel
    const newMoodIndex = getMoodFromSlider(newValue)
    if (newMoodIndex !== currentMoodIndex) {
      const container = document.querySelector('.mood-slider-container')
      if (container) {
        container.classList.add('animating')
        setTimeout(() => {
          container.classList.remove('animating')
        }, 300)
      }
    }
    
    setTimeout(() => setIsAnimating(false), 100) // Much faster for fluid feel
  }

  const handleMoodNext = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep('feeling')
      setIsTransitioning(false)
    }, 200) // Half of transition duration for smooth feel
  }

  const handleFeelingNext = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep('context')
      setIsTransitioning(false)
    }, 200)
  }

  const handleContextNext = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep('complete')
      setIsTransitioning(false)
    }, 200)
    setTimeout(() => {
      onComplete({
        mood: currentMoodIndex, // Send the discrete mood value
        feelingTags: selectedFeelingTags,
        contextTags: selectedContextTags
      })
    }, 2200) // Show completion for 2 seconds after transition
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

  const currentLabel = MOOD_LABELS[currentMoodIndex] || MOOD_LABELS[3]

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

  // Render all steps with slide transitions
  return (
    <div className="mood-steps-container">
      {/* Completion screen */}
      <div 
        className={`mood-step ${currentStep === 'complete' ? 'current' : 'next'}`}
        style={{
          background: 'linear-gradient(135deg, rgb(34,197,94), rgb(21,128,61))'
        }}
      >
        <div className="h-full bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-sm border border-white/20">
              <Check className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <h2 className="text-white text-3xl font-light drop-shadow-lg">Logged</h2>
          </div>
        </div>
      </div>

      {/* Context tags selection */}
      <div 
        className={`mood-step ${
          currentStep === 'context' ? 'current' : 
          currentStep === 'complete' ? 'previous' : 'next'
        }`}
        style={{
          background: `linear-gradient(135deg, rgb(${fluidColors.bg.match(/\d+/g)?.slice(0, 3).join(',') || '59,130,246'}), rgb(${fluidColors.bg.match(/\d+/g)?.slice(3, 6).join(',') || '37,99,235'}))`
        }}
      >
        <div className={`h-full bg-gradient-to-br transition-all duration-300 ease-out flex flex-col`}>
          <div className="flex items-center justify-between p-4 pt-8">
            <button 
              onClick={() => setCurrentStep('feeling')}
              className="text-white hover:text-white/80 text-base font-medium drop-shadow-md transition-colors duration-200"
            >
              Back
            </button>
            <h1 className="text-white font-semibold text-base drop-shadow-md">Context</h1>
            <button 
              onClick={onSkip}
              className="text-white hover:text-white/80 text-base font-medium drop-shadow-md transition-colors duration-200"
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
                  className="opacity-80 transition-all duration-300 ease-out"
                  style={{
                    fill: `rgb(${fluidColors.blob.match(/\d+/g)?.join(',') || '96,165,250'})`
                  }}
                />
              </svg>
            </div>

            <div className="text-center mb-4">
              <h2 className="text-white text-xl font-semibold drop-shadow-md transition-all duration-300 ease-out">{currentLabel}</h2>
              {selectedContextTags.length > 0 && (
                <p className="text-white text-xs mt-1 drop-shadow-sm transition-all duration-200">{selectedContextTags.slice(0, 3).join(', ')}{selectedContextTags.length > 3 ? '...' : ''}</p>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-white text-sm font-semibold mb-4 flex items-center drop-shadow-md">
                What has the biggest impact on you?
                <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center ml-2 backdrop-blur-sm border border-white/20">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
              </h3>

              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {CONTEXT_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleContextTag(tag)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 border ${
                      selectedContextTags.includes(tag)
                        ? 'bg-white/50 text-white border-white/40'
                        : 'bg-white/25 text-white border-white/30 hover:bg-white/35'
                    }`}
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto pb-8">
              <Button
                onClick={handleContextNext}
                disabled={isTransitioning}
                className="w-full bg-white/30 hover:bg-white/40 border border-white/40 text-white py-3 rounded-2xl text-base font-semibold transition-colors duration-200 disabled:opacity-50"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
              >
                Complete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feeling tags selection */}
      <div 
        className={`mood-step ${
          currentStep === 'feeling' ? 'current' : 
          ['context', 'complete'].includes(currentStep) ? 'previous' : 'next'
        }`}
        style={{
          background: `linear-gradient(135deg, rgb(${fluidColors.bg.match(/\d+/g)?.slice(0, 3).join(',') || '59,130,246'}), rgb(${fluidColors.bg.match(/\d+/g)?.slice(3, 6).join(',') || '37,99,235'}))`
        }}
      >
        <div className={`h-full bg-gradient-to-br transition-all duration-300 ease-out flex flex-col`}>
          <div className="flex items-center justify-between p-4 pt-8">
            <button 
              onClick={() => setCurrentStep('mood')}
              className="text-white hover:text-white/80 text-base font-medium drop-shadow-md transition-colors duration-200"
            >
              Back
            </button>
            <h1 className="text-white font-semibold text-base drop-shadow-md">Feeling</h1>
            <button 
              onClick={onSkip}
              className="text-white hover:text-white/80 text-base font-medium drop-shadow-md transition-colors duration-200"
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
                  className="opacity-80 transition-all duration-300 ease-out"
                  style={{
                    fill: `rgb(${fluidColors.blob.match(/\d+/g)?.join(',') || '96,165,250'})`
                  }}
                />
              </svg>
            </div>

            <div className="text-center mb-4">
              <h2 className="text-white text-xl font-semibold drop-shadow-md transition-all duration-300 ease-out">{currentLabel}</h2>
              {selectedFeelingTags.length > 0 && (
                <p className="text-white text-xs mt-1 drop-shadow-sm transition-all duration-200">{selectedFeelingTags.slice(0, 3).join(', ')}{selectedFeelingTags.length > 3 ? '...' : ''}</p>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-white text-sm font-semibold mb-4 flex items-center drop-shadow-md">
                What describes the feeling best?
                <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center ml-2 backdrop-blur-sm border border-white/20">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
              </h3>

              <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                {FEELING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleFeelingTag(tag)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 border ${
                      selectedFeelingTags.includes(tag)
                        ? 'bg-white/50 text-white border-white/40'
                        : 'bg-white/25 text-white border-white/30 hover:bg-white/35'
                    }`}
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto pb-8">
              <Button
                onClick={handleFeelingNext}
                disabled={isTransitioning}
                className="w-full bg-white/30 hover:bg-white/40 border border-white/40 text-white py-3 rounded-2xl text-base font-semibold transition-colors duration-200 disabled:opacity-50"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main mood selection screen */}
      <div 
        className={`mood-step ${
          currentStep === 'mood' ? 'current' : 'previous'
        }`}
        style={{
          background: `linear-gradient(135deg, rgb(${fluidColors.bg.match(/\d+/g)?.slice(0, 3).join(',') || '59,130,246'}), rgb(${fluidColors.bg.match(/\d+/g)?.slice(3, 6).join(',') || '37,99,235'}))`
        }}
      >
        <div className={`h-full bg-gradient-to-br transition-all duration-300 ease-out flex flex-col`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8">
            <div className="w-16"></div> {/* Spacer for center alignment */}
            <h1 className="text-white font-semibold text-base drop-shadow-md">Emotion</h1>
            <button 
              onClick={onSkip}
              className="text-white hover:text-white/80 text-base font-medium drop-shadow-md transition-colors duration-200"
            >
              Cancel
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="text-center mb-8">
              <h2 className="text-white text-lg font-light mb-1 drop-shadow-lg transition-all duration-300 ease-out opacity-90">
                Choose how you're
              </h2>
              <h2 className="text-white text-lg font-light drop-shadow-lg transition-all duration-300 ease-out opacity-90">
                feeling right now
              </h2>
            </div>

            {/* Animated Blob */}
            <div className="relative mb-8">
              <svg 
                width="200" 
                height="200" 
                viewBox="0 0 300 300"
                className={`transition-all duration-300 ease-out ${isAnimating ? 'scale-110' : 'scale-100'}`}
              >
                {/* Outer glow layers */}
                <path
                  d={getBlobPath(moodValue)}
                  className="opacity-20 transition-all duration-300 ease-out"
                  transform="scale(1.3) translate(-45, -45)"
                  style={{
                    fill: `rgb(${fluidColors.blob.match(/\d+/g)?.join(',') || '96,165,250'})`
                  }}
                />
                <path
                  d={getBlobPath(moodValue)}
                  className="opacity-40 transition-all duration-300 ease-out"
                  transform="scale(1.15) translate(-22.5, -22.5)"
                  style={{
                    fill: `rgb(${fluidColors.blob.match(/\d+/g)?.join(',') || '96,165,250'})`
                  }}
                />
                
                {/* Main blob */}
                <path
                  d={getBlobPath(moodValue)}
                  className="transition-all duration-300 ease-out"
                  style={{
                    fill: `rgb(${fluidColors.blob.match(/\d+/g)?.join(',') || '96,165,250'})`,
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
                  className="fill-white opacity-30 transition-all duration-300"
                />
              </svg>
            </div>

            {/* Mood Label */}
            <div className="text-center mb-8">
              <h3 className="text-white text-xl font-semibold drop-shadow-md transition-all duration-300 ease-out">
                {currentLabel}
              </h3>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="p-6 pb-8">
            {/* Slider */}
            <div className="mb-6">
              <div className="flex justify-between text-white text-xs mb-3 font-medium drop-shadow-sm">
                <span>VERY UNPLEASANT</span>
                <span>VERY PLEASANT</span>
              </div>
              
              <div className="mood-slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={sliderValue}
                  onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                  className="mood-slider"
                />
              </div>
            </div>

            {/* Next Button */}
            <Button
              onClick={handleMoodNext}
              disabled={isTransitioning}
              className="w-full bg-white/30 hover:bg-white/40 border border-white/40 text-white py-3 rounded-2xl text-base font-semibold transition-colors duration-200 disabled:opacity-50"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 