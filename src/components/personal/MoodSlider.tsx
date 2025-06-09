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

// Color stops for smooth interpolation (0-100 range) - Apple Health sophisticated palette
const COLOR_STOPS = [
  { position: 0, bg: [140, 120, 120], blob: [155, 135, 135] },      // Sophisticated muted red-gray
  { position: 16.67, bg: [150, 130, 115], blob: [165, 145, 130] },  // Warm muted brown-orange
  { position: 33.33, bg: [145, 140, 125], blob: [160, 155, 140] },  // Sophisticated warm gray-yellow
  { position: 50, bg: [125, 135, 155], blob: [140, 150, 170] },     // Cool sophisticated blue-gray
  { position: 66.67, bg: [130, 145, 135], blob: [145, 160, 150] },  // Elegant muted green-gray
  { position: 83.33, bg: [135, 150, 140], blob: [150, 165, 155] },  // Refined sage green
  { position: 100, bg: [140, 155, 145], blob: [155, 170, 160] }     // Premium mint-gray
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

// Context/impact tags  
const CONTEXT_TAGS = [
  'Health', 'Exercise', 'Self-care', 'Hobbies', 'Identity', 'Spirituality',
  'Community', 'Family', 'Friends', 'Partner', 'Dating', 'Goals', 'Work', 
  'Education', 'Travel', 'Weather', 'News', 'Money', 'Achievements', 'Challenges'
]

type FlowStep = 'mood' | 'feeling' | 'context' | 'complete'

// Dynamic feeling tags based on mood level
const getMoodSpecificFeelings = (moodIndex: number): string[] => {
  const moodFeelings = {
    0: [ // Very Unpleasant
      'Angry', 'Frustrated', 'Devastated', 'Hopeless', 'Overwhelmed', 
      'Anxious', 'Depressed', 'Irritated', 'Furious', 'Miserable',
      'Distressed', 'Exhausted', 'Bitter', 'Resentful', 'Helpless',
      'Defeated', 'Isolated', 'Worried', 'Panicked', 'Discouraged'
    ],
    1: [ // Unpleasant
      'Sad', 'Disappointed', 'Stressed', 'Uncomfortable', 'Uneasy',
      'Troubled', 'Bothered', 'Concerned', 'Disheartened', 'Gloomy',
      'Tense', 'Restless', 'Unsatisfied', 'Drained', 'Weary',
      'Cautious', 'Skeptical', 'Uncertain', 'Doubtful', 'Melancholy'
    ],
    2: [ // Slightly Unpleasant
      'Tired', 'Bored', 'Restless', 'Indifferent', 'Sluggish',
      'Unmotivated', 'Apathetic', 'Listless', 'Distracted', 'Disconnected',
      'Uninspired', 'Passive', 'Withdrawn', 'Reserved', 'Hesitant',
      'Lackluster', 'Mild', 'Vacant', 'Detached', 'Flat'
    ],
    3: [ // Neutral
      'Calm', 'Balanced', 'Steady', 'Centered', 'Stable',
      'Composed', 'Tranquil', 'Even-tempered', 'Neutral', 'Clear-minded',
      'Focused', 'Present', 'Grounded', 'Relaxed', 'At ease',
      'Settled', 'Objective', 'Contemplative', 'Mindful', 'Serene'
    ],
    4: [ // Slightly Pleasant
      'Content', 'Satisfied', 'Pleasant', 'Comfortable', 'Peaceful',
      'Optimistic', 'Hopeful', 'Positive', 'Encouraged', 'Uplifted',
      'Gentle', 'Warm', 'Friendly', 'Appreciative', 'Grateful',
      'Kind', 'Soft', 'Tender', 'Understanding', 'Accepting'
    ],
    5: [ // Pleasant
      'Happy', 'Cheerful', 'Delighted', 'Pleased', 'Joyful',
      'Upbeat', 'Bright', 'Enthusiastic', 'Energetic', 'Lively',
      'Excited', 'Engaged', 'Confident', 'Proud', 'Accomplished',
      'Successful', 'Fulfilled', 'Thriving', 'Vibrant', 'Radiant'
    ],
    6: [ // Very Pleasant
      'Ecstatic', 'Euphoric', 'Blissful', 'Overjoyed', 'Elated',
      'Fantastic', 'Amazing', 'Incredible', 'Wonderful', 'Magnificent',
      'Brilliant', 'Spectacular', 'Triumphant', 'Victorious', 'Inspired',
      'Exhilarated', 'Passionate', 'Loving', 'Blessed', 'Transcendent'
    ]
  }
  
  return moodFeelings[moodIndex as keyof typeof moodFeelings] || moodFeelings[3]
}
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

  // Create Apple Health-style organic blob patterns
  const getMoodBlobPattern = (moodValue: number, size: number = 200) => {
    const centerX = size / 2
    const centerY = size / 2
    
    switch (moodValue) {
      case 0: // Very Unpleasant - Jagged organic shape
        return {
          main: createOrganicShape(centerX, centerY, 70, 8, 0.4, 0),
          layer1: createOrganicShape(centerX, centerY, 55, 8, 0.3, 25),
          layer2: createOrganicShape(centerX, centerY, 40, 8, 0.25, 50),
          center: createSoftCircle(centerX, centerY, 12)
        }
      
      case 1: // Unpleasant - Multi-layered organic flower  
        return {
          main: createOrganicShape(centerX, centerY, 75, 12, 0.3, 0),
          layer1: createOrganicShape(centerX, centerY, 60, 12, 0.25, 15),
          layer2: createOrganicShape(centerX, centerY, 45, 12, 0.2, 30),
          center: createSoftCircle(centerX, centerY, 15)
        }
      
      case 2: // Slightly Unpleasant - Flowing organic blob
        return {
          main: createOrganicShape(centerX, centerY, 65, 6, 0.25, 0),
          layer1: createOrganicShape(centerX, centerY, 50, 6, 0.2, 30),
          layer2: createOrganicShape(centerX, centerY, 35, 6, 0.15, 60),
          center: createSoftCircle(centerX, centerY, 14)
        }
      
      case 3: // Neutral - Concentric circles (Apple Health style)
        return {
          main: createSoftCircle(centerX, centerY, 70),
          layer1: createSoftCircle(centerX, centerY, 55),
          layer2: createSoftCircle(centerX, centerY, 40),
          center: createSoftCircle(centerX, centerY, 15)
        }
      
      case 4: // Slightly Pleasant - Soft rounded petals
        return {
          main: createOrganicShape(centerX, centerY, 68, 5, 0.15, 0),
          layer1: createOrganicShape(centerX, centerY, 54, 5, 0.12, 36),
          layer2: createOrganicShape(centerX, centerY, 40, 5, 0.1, 72),
          center: createSoftCircle(centerX, centerY, 16)
        }
      
      case 5: // Pleasant - Flower with soft petals (like Apple Health)
        return {
          main: createOrganicShape(centerX, centerY, 72, 8, 0.2, 0),
          layer1: createOrganicShape(centerX, centerY, 58, 8, 0.15, 22.5),
          layer2: createOrganicShape(centerX, centerY, 44, 8, 0.12, 45),
          center: createSoftCircle(centerX, centerY, 18)
        }
      
      case 6: // Very Pleasant - Bright layered flower
        return {
          main: createOrganicShape(centerX, centerY, 75, 10, 0.18, 0),
          layer1: createOrganicShape(centerX, centerY, 62, 10, 0.14, 18),
          layer2: createOrganicShape(centerX, centerY, 48, 10, 0.11, 36),
          center: createSoftCircle(centerX, centerY, 20)
        }
      
      default:
        return {
          main: createSoftCircle(centerX, centerY, 60),
          layer1: createSoftCircle(centerX, centerY, 45),
          layer2: createSoftCircle(centerX, centerY, 30),
          center: createSoftCircle(centerX, centerY, 15)
        }
    }
  }

  // Create smooth organic shapes (Apple Health style)
  const createOrganicShape = (centerX: number, centerY: number, baseRadius: number, lobes: number, variation: number, rotation: number = 0) => {
    const points = []
    const angleStep = (Math.PI * 2) / (lobes * 4) // More points for smoother curves
    const rotationRad = (rotation * Math.PI) / 180
    
    // Generate organic points with smooth variation
    for (let i = 0; i < lobes * 4; i++) {
      const angle = (i * angleStep) + rotationRad
      
      // Create petal-like lobes with smooth transitions
      const lobePhase = (i / 4) % 1
      const lobeFactor = Math.pow(Math.sin(lobePhase * Math.PI), 0.6) // Petal shape
      
      // Add organic variation
      const organicVariation = Math.sin(angle * lobes + variation * 10) * variation
      const radius = baseRadius * (0.6 + 0.4 * lobeFactor + organicVariation)
      
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      points.push([x, y])
    }
    
    // Create smooth curved path using bezier curves
    let path = `M ${points[0][0]} ${points[0][1]}`
    
    for (let i = 0; i < points.length; i++) {
      const current = points[i]
      const next = points[(i + 1) % points.length]
      const nextNext = points[(i + 2) % points.length]
      
      // Calculate smooth control points
      const cp1x = current[0] + (next[0] - current[0]) * 0.3
      const cp1y = current[1] + (next[1] - current[1]) * 0.3
      const cp2x = next[0] - (nextNext[0] - current[0]) * 0.15
      const cp2y = next[1] - (nextNext[1] - current[1]) * 0.15
      
      path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${next[0]} ${next[1]}`
    }
    
    path += ' Z'
    return path
  }

  // Create soft circle with slight organic variation
  const createSoftCircle = (centerX: number, centerY: number, radius: number) => {
    const points = 32 // High point count for smooth circle
    let path = ''
    
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2
      const organicRadius = radius + Math.sin(angle * 3) * (radius * 0.02) // Very subtle variation
      
      const x = centerX + Math.cos(angle) * organicRadius
      const y = centerY + Math.sin(angle) * organicRadius
      
      if (i === 0) {
        path += `M ${x} ${y}`
      } else {
        // Use smooth curves for organic feel
        const prevAngle = ((i - 1) / points) * Math.PI * 2
        const prevRadius = radius + Math.sin(prevAngle * 3) * (radius * 0.02)
        const prevX = centerX + Math.cos(prevAngle) * prevRadius
        const prevY = centerY + Math.sin(prevAngle) * prevRadius
        
        const cp1x = prevX + Math.cos(prevAngle + Math.PI / 2) * (prevRadius * 0.2)
        const cp1y = prevY + Math.sin(prevAngle + Math.PI / 2) * (prevRadius * 0.2)
        const cp2x = x - Math.cos(angle + Math.PI / 2) * (organicRadius * 0.2)
        const cp2y = y - Math.sin(angle + Math.PI / 2) * (organicRadius * 0.2)
        
        path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x} ${y}`
      }
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
              <svg width="60" height="60" viewBox="0 0 120 120" className="transition-all duration-500 ease-out">
                {(() => {
                  const pattern = getMoodBlobPattern(currentMoodIndex, 120)
                  const mainColor = fluidColors.blob.match(/\d+/g)?.join(',') || '96,165,250'
                  
                  return (
                    <>
                      {/* Outermost ambient glow */}
                      <path
                        d={pattern.main}
                        className="mood-blob-glow"
                        style={{
                          fill: `rgba(${mainColor}, 0.06)`,
                          filter: 'blur(16px)',
                          transform: 'scale(1.8)',
                          transformOrigin: '100px 100px'
                        }}
                      />
                      
                      {/* Secondary ambient glow */}
                      <path
                        d={pattern.layer1}
                        className="mood-blob-glow"
                        style={{
                          fill: `rgba(${mainColor}, 0.12)`,
                          filter: 'blur(10px)',
                          transform: 'scale(1.5)',
                          transformOrigin: '100px 100px'
                        }}
                      />
                      
                      {/* Third glow layer */}
                      <path
                        d={pattern.layer2}
                        className="mood-blob-glow"
                        style={{
                          fill: `rgba(${mainColor}, 0.18)`,
                          filter: 'blur(6px)',
                          transform: 'scale(1.3)',
                          transformOrigin: '100px 100px'
                        }}
                      />
                      
                      {/* Outer glass layer */}
                      <path
                        d={pattern.main}
                        className={`mood-blob-main transition-all duration-500 ease-out ${
                          currentMoodIndex >= 4 ? 'mood-blob-pleasant' : ''
                        }`}
                        style={{
                          fill: `rgba(${mainColor}, 0.65)`,
                          filter: 'blur(1px)'
                        }}
                      />
                      
                      {/* Second glass layer - Warmer tint */}
                      <path
                        d={pattern.layer1}
                        className={`mood-blob-layer1 transition-all duration-500 ease-out ${
                          currentMoodIndex >= 5 ? 'mood-blob-petals' : ''
                        }`}
                        style={{
                          fill: `rgba(${Math.round(parseInt(mainColor.split(',')[0]) * 1.25)}, ${Math.round(parseInt(mainColor.split(',')[1]) * 1.1)}, ${Math.round(parseInt(mainColor.split(',')[2]) * 0.75)}, 0.75)`
                        }}
                      />
                      
                      {/* Third glass layer - Cooler tint */}
                      <path
                        d={pattern.layer2}
                        className="mood-blob-layer2 transition-all duration-500 ease-out"
                        style={{
                          fill: `rgba(${Math.round(parseInt(mainColor.split(',')[0]) * 0.75)}, ${Math.round(parseInt(mainColor.split(',')[1]) * 1.25)}, ${Math.round(parseInt(mainColor.split(',')[2]) * 1.15)}, 0.65)`
                        }}
                      />
                      
                      {/* Inner glass layer */}
                      <path
                        d={pattern.center}
                        className="mood-blob-float transition-all duration-500 ease-out"
                        style={{
                          fill: `rgba(${Math.round(parseInt(mainColor.split(',')[0]) * 1.1)}, ${Math.round(parseInt(mainColor.split(',')[1]) * 1.2)}, ${Math.round(parseInt(mainColor.split(',')[2]) * 1.05)}, 0.8)`,
                          transform: 'scale(0.6)',
                          transformOrigin: '100px 100px'
                        }}
                      />
                      
                      {/* Core bright layer */}
                      <path
                        d={pattern.center}
                        className="mood-blob-float transition-all duration-500 ease-out"
                        style={{
                          fill: `rgba(255, 255, 255, 0.7)`,
                          transform: 'scale(0.3)',
                          transformOrigin: '100px 100px'
                        }}
                      />
                      
                      {/* Central bright dot */}
                      <circle
                        cx="100"
                        cy="100"
                        r={3 + currentMoodIndex * 0.3}
                        className={`transition-all duration-500 ease-out mood-blob-float ${
                          currentMoodIndex === 6 ? 'mood-blob-shimmer' : ''
                        }`}
                        style={{
                          fill: `rgba(255, 255, 255, 0.9)`
                        }}
                      />
                    </>
                  )
                })()}
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
              <svg width="60" height="60" viewBox="0 0 120 120" className="transition-all duration-500 ease-out">
                {(() => {
                  const pattern = getMoodBlobPattern(currentMoodIndex, 120)
                  const mainColor = fluidColors.blob.match(/\d+/g)?.join(',') || '96,165,250'
                  
                  return (
                    <>
                      {/* Outermost glow - Apple Health style */}
                      <path
                        d={pattern.main}
                        className="mood-blob-glow"
                        style={{
                          fill: `rgba(${mainColor}, 0.08)`,
                          filter: 'blur(8px)',
                          transform: 'scale(1.5)',
                          transformOrigin: '60px 60px'
                        }}
                      />
                      
                      {/* Secondary glow layer */}
                      <path
                        d={pattern.layer1}
                        className="mood-blob-glow"
                        style={{
                          fill: `rgba(${mainColor}, 0.15)`,
                          filter: 'blur(4px)',
                          transform: 'scale(1.3)',
                          transformOrigin: '60px 60px'
                        }}
                      />
                      
                      {/* Outer glass layer */}
                      <path
                        d={pattern.main}
                        className="mood-blob-main"
                        style={{
                          fill: `rgba(${mainColor}, 0.6)`,
                          filter: 'blur(1px)'
                        }}
                      />
                      
                      {/* Second glass layer - Warmer tint */}
                      <path
                        d={pattern.layer1}
                        className="mood-blob-layer1"
                        style={{
                          fill: `rgba(${Math.round(parseInt(mainColor.split(',')[0]) * 1.2)}, ${Math.round(parseInt(mainColor.split(',')[1]) * 1.1)}, ${Math.round(parseInt(mainColor.split(',')[2]) * 0.8)}, 0.7)`
                        }}
                      />
                      
                      {/* Third glass layer - Cooler tint */}
                      <path
                        d={pattern.layer2}
                        className="mood-blob-layer2"
                        style={{
                          fill: `rgba(${Math.round(parseInt(mainColor.split(',')[0]) * 0.8)}, ${Math.round(parseInt(mainColor.split(',')[1]) * 1.2)}, ${Math.round(parseInt(mainColor.split(',')[2]) * 1.1)}, 0.6)`
                        }}
                      />
                      
                      {/* Inner glass layer */}
                      <path
                        d={pattern.center}
                        className="mood-blob-float"
                        style={{
                          fill: `rgba(${Math.round(parseInt(mainColor.split(',')[0]) * 1.1)}, ${Math.round(parseInt(mainColor.split(',')[1]) * 1.15)}, ${Math.round(parseInt(mainColor.split(',')[2]) * 1.05)}, 0.8)`,
                          transform: 'scale(0.7)',
                          transformOrigin: '60px 60px'
                        }}
                      />
                      
                      {/* Core highlight */}
                      <path
                        d={pattern.center}
                        className="mood-blob-float"
                        style={{
                          fill: `rgba(255, 255, 255, 0.6)`,
                          transform: 'scale(0.4)',
                          transformOrigin: '60px 60px'
                        }}
                      />
                    </>
                  )
                })()}
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
                {getMoodSpecificFeelings(currentMoodIndex).map((tag) => (
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
                viewBox="0 0 200 200"
                className={`transition-all duration-500 ease-out ${isAnimating ? 'scale-110' : 'scale-100'}`}
              >
                {/* Get current mood pattern */}
                {(() => {
                  const pattern = getMoodBlobPattern(currentMoodIndex, 200)
                  const mainColor = fluidColors.blob.match(/\d+/g)?.join(',') || '96,165,250'
                  
                  return (
                    <>
                      {/* Outermost ambient glow */}
                      <path
                        d={pattern.main}
                        className="mood-blob-glow"
                        style={{
                          fill: `rgba(${mainColor}, 0.06)`,
                          filter: 'blur(16px)',
                          transform: 'scale(1.8)',
                          transformOrigin: '100px 100px'
                        }}
                      />
                      
                      {/* Secondary ambient glow */}
                      <path
                        d={pattern.layer1}
                        className="mood-blob-glow"
                        style={{
                          fill: `rgba(${mainColor}, 0.12)`,
                          filter: 'blur(10px)',
                          transform: 'scale(1.5)',
                          transformOrigin: '100px 100px'
                        }}
                      />
                      
                      {/* Third glow layer */}
                      <path
                        d={pattern.layer2}
                        className="mood-blob-glow"
                        style={{
                          fill: `rgba(${mainColor}, 0.18)`,
                          filter: 'blur(6px)',
                          transform: 'scale(1.3)',
                          transformOrigin: '100px 100px'
                        }}
                      />
                      
                      {/* Outer glass layer */}
                      <path
                        d={pattern.main}
                        className={`mood-blob-main transition-all duration-500 ease-out ${
                          currentMoodIndex >= 4 ? 'mood-blob-pleasant' : ''
                        }`}
                        style={{
                          fill: `rgba(${mainColor}, 0.65)`,
                          filter: 'blur(1px)'
                        }}
                      />
                      
                      {/* Second glass layer - Warmer tint */}
                      <path
                        d={pattern.layer1}
                        className={`mood-blob-layer1 transition-all duration-500 ease-out ${
                          currentMoodIndex >= 5 ? 'mood-blob-petals' : ''
                        }`}
                        style={{
                          fill: `rgba(${Math.round(parseInt(mainColor.split(',')[0]) * 1.25)}, ${Math.round(parseInt(mainColor.split(',')[1]) * 1.1)}, ${Math.round(parseInt(mainColor.split(',')[2]) * 0.75)}, 0.75)`
                        }}
                      />
                      
                      {/* Third glass layer - Cooler tint */}
                      <path
                        d={pattern.layer2}
                        className="mood-blob-layer2 transition-all duration-500 ease-out"
                        style={{
                          fill: `rgba(${Math.round(parseInt(mainColor.split(',')[0]) * 0.75)}, ${Math.round(parseInt(mainColor.split(',')[1]) * 1.25)}, ${Math.round(parseInt(mainColor.split(',')[2]) * 1.15)}, 0.65)`
                        }}
                      />
                      
                      {/* Inner glass layer */}
                      <path
                        d={pattern.center}
                        className="mood-blob-float transition-all duration-500 ease-out"
                        style={{
                          fill: `rgba(${Math.round(parseInt(mainColor.split(',')[0]) * 1.1)}, ${Math.round(parseInt(mainColor.split(',')[1]) * 1.2)}, ${Math.round(parseInt(mainColor.split(',')[2]) * 1.05)}, 0.8)`,
                          transform: 'scale(0.6)',
                          transformOrigin: '100px 100px'
                        }}
                      />
                      
                      {/* Core bright layer */}
                      <path
                        d={pattern.center}
                        className="mood-blob-float transition-all duration-500 ease-out"
                        style={{
                          fill: `rgba(255, 255, 255, 0.7)`,
                          transform: 'scale(0.3)',
                          transformOrigin: '100px 100px'
                        }}
                      />
                      
                      {/* Central bright dot */}
                      <circle
                        cx="100"
                        cy="100"
                        r={3 + currentMoodIndex * 0.3}
                        className={`transition-all duration-500 ease-out mood-blob-float ${
                          currentMoodIndex === 6 ? 'mood-blob-shimmer' : ''
                        }`}
                        style={{
                          fill: `rgba(255, 255, 255, 0.9)`
                        }}
                      />
                    </>
                  )
                })()}
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