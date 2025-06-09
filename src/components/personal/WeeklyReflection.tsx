'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Heart, Calendar, TrendingUp, Edit3, ChevronLeft, ChevronRight } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import MoodSlider from './MoodSlider'

// Vibrant emotion colors for Weekly Reflection (brighter than MoodSlider)
const COLOR_STOPS = [
  { position: 0, bg: [239, 68, 68], blob: [248, 113, 113] },      // Bright red
  { position: 16.67, bg: [249, 115, 22], blob: [251, 146, 60] },  // Bright orange
  { position: 33.33, bg: [234, 179, 8], blob: [250, 204, 21] },   // Bright yellow
  { position: 50, bg: [59, 130, 246], blob: [96, 165, 250] },     // Bright blue
  { position: 66.67, bg: [34, 197, 94], blob: [74, 222, 128] },   // Bright green
  { position: 83.33, bg: [34, 197, 94], blob: [34, 197, 94] },    // Bright green
  { position: 100, bg: [16, 185, 129], blob: [52, 211, 153] }     // Bright emerald
]

// Get color for mood level (0-6)
const getMoodColor = (moodIndex: number): string => {
  const colorIndex = Math.min(Math.max(moodIndex, 0), 6) // Clamp between 0-6
  const color = COLOR_STOPS[colorIndex]?.bg || COLOR_STOPS[3].bg // Default to neutral
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
}

interface DailyReflection {
  date: string
  mood: number // 0-6 (Apple Health style scale)
  feelingTags: string[]
  contextTags: string[]
  note?: string
}

interface WeeklyReflectionProps {
  className?: string
}

// Rotating journal prompts
const JOURNAL_PROMPTS = [
  "What made you feel proud this week?",
  "Any regrets you want to process?",
  "What would success look like next week?",
  "What patterns did you notice in your mood?",
  "What gave you the most energy this week?",
  "How did you handle challenges this week?",
  "What are you most grateful for?",
  "What would you do differently?"
]

export default function WeeklyReflection({ className }: WeeklyReflectionProps) {
  const [reflections, setReflections] = useState<Record<string, DailyReflection>>({})
  const [showMoodDialog, setShowMoodDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [weeklyNote, setWeeklyNote] = useState('')
  const [currentWeek, setCurrentWeek] = useState(new Date()) // Add current week state

  useEffect(() => {
    initializeReflection()
  }, [currentWeek]) // Re-initialize when week changes

  const initializeReflection = async () => {
    await loadReflections()
    setCurrentPrompt(getWeeklyPrompt())
    
    // Check if today's reflection exists (only for current week)
    const isCurrentWeek = getCurrentWeekDates().includes(new Date().toISOString().split('T')[0])
    
    if (isCurrentWeek) {
      const today = new Date().toISOString().split('T')[0]
      const saved = await storage.load('weekly-reflections') || {}
      const todayReflection = saved[today]
      
      if (!todayReflection || todayReflection.mood === undefined) {
        // No today's data - show mood dialog after a short delay
        setTimeout(() => setShowMoodDialog(true), 1000)
      }
    }
  }

  const loadReflections = async () => {
    try {
      const saved = await storage.load('weekly-reflections') || {}
      setReflections(saved)
      
      const weeklyNoteData = await storage.load('weekly-reflection-note') || ''
      setWeeklyNote(weeklyNoteData)
    } catch (error) {
      console.error('Error loading reflections:', error)
    }
  }

  const saveReflections = async (newReflections: Record<string, DailyReflection>) => {
    setReflections(newReflections)
    await storage.save('weekly-reflections', newReflections)
  }

  const saveWeeklyNote = async (note: string) => {
    setWeeklyNote(note)
    await storage.save('weekly-reflection-note', note)
  }

  const getWeeklyPrompt = () => {
    const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7))
    return JOURNAL_PROMPTS[weekNumber % JOURNAL_PROMPTS.length]
  }

  const getCurrentWeekDates = () => {
    // Use currentWeek instead of today
    const referenceDate = new Date(currentWeek)
    const startOfWeek = new Date(referenceDate)
    const dayOfWeek = referenceDate.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startOfWeek.setDate(referenceDate.getDate() - daysFromMonday)
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  // Add week navigation functions
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    if (direction === 'prev') {
      newWeek.setDate(newWeek.getDate() - 7)
    } else {
      newWeek.setDate(newWeek.getDate() + 7)
    }
    setCurrentWeek(newWeek)
  }

  const canNavigateNext = () => {
    const nextWeek = new Date(currentWeek)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const nextWeekStart = new Date(nextWeek)
    const dayOfWeek = nextWeek.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    nextWeekStart.setDate(nextWeek.getDate() - daysFromMonday)
    
    // Can navigate if the week start date is not in the future
    return nextWeekStart <= new Date()
  }

  const getWeekLabel = () => {
    const weekDates = getCurrentWeekDates()
    const startDate = new Date(weekDates[0])
    const endDate = new Date(weekDates[6])
    
    // Check if this is current week
    const today = new Date().toISOString().split('T')[0]
    const isCurrentWeek = weekDates.includes(today)
    
    if (isCurrentWeek) {
      return 'This Week'
    }
    
    // Format week range
    const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endFormatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    
    // If same month, just show "Jun 3-9"
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.toLocaleDateString('en-US', { month: 'short' })} ${startDate.getDate()}-${endDate.getDate()}`
    }
    
    // If different months, show "Jun 30 - Jul 6"
    return `${startFormatted} - ${endFormatted}`
  }

  const updateDailyReflection = async (date: string, updates: Partial<DailyReflection>) => {
    const existing = reflections[date] || { date, mood: 3, feelingTags: [], contextTags: [] }
    const updated = { ...existing, ...updates }
    
    const newReflections = { ...reflections, [date]: updated }
    await saveReflections(newReflections)
  }

  const handleMoodComplete = async (data: { mood: number, feelingTags: string[], contextTags: string[] }) => {
    const today = new Date().toISOString().split('T')[0]
    
    await updateDailyReflection(today, {
      mood: data.mood,
      feelingTags: data.feelingTags,
      contextTags: data.contextTags
    })
    
    // Close the dialog
    setShowMoodDialog(false)
  }

  const handleSkipMood = () => {
    setShowMoodDialog(false)
  }

  const handleDayClick = (date: string) => {
    const reflection = reflections[date]
    
    // If no reflection data exists, go directly to MoodSlider
    if (!reflection || reflection.mood === undefined) {
      setSelectedDate(null) // Clear any selected date
      setShowMoodDialog(true)
      return
    }
    
    // If reflection exists, show the detailed dialog
    setSelectedDate(date)
  }

  const getMoodLabel = (moodIndex: number): string => {
    const labels = [
      'Very Unpleasant',
      'Unpleasant', 
      'Slightly Unpleasant',
      'Neutral',
      'Slightly Pleasant',
      'Pleasant',
      'Very Pleasant'
    ]
    return labels[moodIndex] || 'Unknown'
  }

  const generateInsights = () => {
    const weekDates = getCurrentWeekDates()
    const weekData = weekDates.map(date => reflections[date]).filter(Boolean)
    
    if (weekData.length === 0) return "Start tracking your mood to see insights!"
    
    const avgMood = weekData.reduce((sum, day) => sum + (day.mood + 1), 0) / weekData.length // Convert 0-6 to 1-7 for display
    
    const allFeelingTags = weekData.flatMap(day => day.feelingTags || [])
    const allContextTags = weekData.flatMap(day => day.contextTags || [])
    
    const feelingTagCounts = allFeelingTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const contextTagCounts = allContextTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topFeelingTags = Object.entries(feelingTagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([tag]) => tag)
    
    const topContextTags = Object.entries(contextTagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([tag]) => tag)
    
    const bestDay = weekData.reduce((best, day) => day.mood > best.mood ? day : best)
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const bestDayName = dayNames[weekDates.indexOf(bestDay.date)]
    
    let insight = `Mood averaged ${avgMood.toFixed(1)}/7. `
    
    if (bestDayName) {
      insight += `${bestDayName} was your best day. `
    }
    
    if (topFeelingTags.length > 0) {
      insight += `Common feelings: ${topFeelingTags.join(', ')}. `
    }
    
    if (topContextTags.length > 0) {
      insight += `Key influences: ${topContextTags.join(', ')}.`
    }
    
    return insight
  }

  const weekDates = getCurrentWeekDates()
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <>
      <Card className={`bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden h-full flex flex-col ${className}`}>
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span>Weekly Reflection</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMoodDialog(true)}
              className="text-gray-400 hover:text-white p-2"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 pt-0 flex-1 flex flex-col">
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="text-gray-400 hover:text-white p-1"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="text-sm font-semibold text-white flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {getWeekLabel()}
            </h3>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek('next')}
              disabled={!canNavigateNext()}
              className="text-gray-400 hover:text-white disabled:opacity-30 p-1"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekly Mood Chart */}
          <div className="flex-1">
            <div className="space-y-4">
              {/* Mood Chart */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Mood</span>
                  <Heart className="h-3 w-3 text-pink-400" />
                </div>
                <div className="flex space-x-2">
                  {weekDates.map((date, index) => {
                    const reflection = reflections[date]
                    const mood = reflection?.mood
                    const intensity = mood !== undefined ? (mood + 1) / 7 : 0 // Convert 0-6 to 0-1
                    const moodColor = mood !== undefined ? getMoodColor(mood) : 'rgb(75, 85, 99)' // gray-600
                    
                    return (
                      <div key={date} className="flex-1 text-center">
                        <div 
                          className="h-20 rounded-xl cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105"
                          style={{ 
                            backgroundColor: moodColor,
                            opacity: mood !== undefined ? Math.max(0.8, intensity) : 0.3 
                          }}
                          onClick={() => handleDayClick(date)}
                        />
                        <span className="text-sm text-gray-400 mt-2 block font-medium">{dayNames[index]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mood Slider Dialog - iPhone-sized centered modal */}
      {showMoodDialog && (
        <Dialog open={showMoodDialog} onOpenChange={setShowMoodDialog}>
          <DialogContent className="max-w-sm w-[375px] h-[667px] p-0 border-4 border-white/30 bg-black/10 backdrop-blur-md overflow-hidden rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] ring-1 ring-white/10 [&>button]:hidden">
            <MoodSlider
              initialValue={3}
              onComplete={handleMoodComplete}
              onSkip={handleSkipMood}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Daily Reflection Editor - for past days */}
      {selectedDate && (
        <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
          <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border-2 border-white/20 text-white max-w-lg w-[90vw] h-[85vh] overflow-hidden rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.5)] flex flex-col">
            {(() => {
              const reflection = reflections[selectedDate]
              if (!reflection) return null

              const moodColor = getMoodColor(reflection.mood)
              const gradientStyle = {
                background: `linear-gradient(135deg, ${moodColor}15, ${moodColor}05)`
              }

              return (
                <div className="flex flex-col h-full p-4 space-y-4 overflow-hidden">
                  {/* Header */}
                  <div className="text-center border-b border-white/10 pb-4 flex-shrink-0">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Heart className="h-4 w-4 text-pink-400" />
                      <h2 className="text-lg font-bold text-white">Daily Reflection</h2>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {/* Mood Display - More compact */}
                    <div 
                      className="text-center py-4 rounded-xl border border-white/10 flex-shrink-0"
                      style={gradientStyle}
                    >
                      <div className="flex justify-center mb-3">
                        <div className="relative">
                          {/* Glow effect */}
                          <div 
                            className="absolute inset-0 w-14 h-14 rounded-full blur-lg opacity-30"
                            style={{ backgroundColor: moodColor }}
                          />
                          {/* Main mood circle */}
                          <div 
                            className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20"
                            style={{ backgroundColor: moodColor }}
                          >
                            <Heart className="h-6 w-6 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">
                        {getMoodLabel(reflection.mood)}
                      </h3>
                      <p className="text-xs text-gray-300 font-medium mb-3">Overall Emotional State</p>
                      
                      {/* Mood scale indicator */}
                      <div className="flex justify-center">
                        <div className="flex space-x-1">
                          {[0, 1, 2, 3, 4, 5, 6].map((level) => (
                            <div
                              key={level}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                                level <= reflection.mood 
                                  ? 'opacity-100 scale-110' 
                                  : 'opacity-30'
                              }`}
                              style={{ 
                                backgroundColor: level <= reflection.mood ? moodColor : '#6B7280' 
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Feeling Tags - Compact with scrolling */}
                    {reflection.feelingTags && reflection.feelingTags.length > 0 && (
                      <div className="bg-blue-500/5 rounded-xl p-3 border border-blue-500/20 flex-shrink-0">
                        <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 shadow-lg"></div>
                          Feelings & Emotions
                          <span className="ml-2 text-xs bg-blue-400/20 text-blue-300 px-1.5 py-0.5 rounded-full">
                            {reflection.feelingTags.length}
                          </span>
                        </h4>
                        <div className="max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400/20 scrollbar-track-transparent">
                          <div className="flex flex-wrap gap-1.5 pr-1">
                            {reflection.feelingTags.map((tag, index) => (
                              <span
                                key={tag}
                                className="px-2.5 py-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 text-blue-200 rounded-lg text-xs font-medium shadow-sm backdrop-blur-sm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Context Tags - Compact with scrolling */}
                    {reflection.contextTags && reflection.contextTags.length > 0 && (
                      <div className="bg-purple-500/5 rounded-xl p-3 border border-purple-500/20 flex-shrink-0">
                        <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 shadow-lg"></div>
                          Context & Influences
                          <span className="ml-2 text-xs bg-purple-400/20 text-purple-300 px-1.5 py-0.5 rounded-full">
                            {reflection.contextTags.length}
                          </span>
                        </h4>
                        <div className="max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400/20 scrollbar-track-transparent">
                          <div className="flex flex-wrap gap-1.5 pr-1">
                            {reflection.contextTags.map((tag, index) => (
                              <span
                                key={tag}
                                className="px-2.5 py-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-400/30 text-purple-200 rounded-lg text-xs font-medium shadow-sm backdrop-blur-sm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary Stats - More compact */}
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex-shrink-0">
                      <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 shadow-lg"></div>
                        Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2 bg-white/5 rounded-lg border border-white/10">
                          <div className="text-lg font-bold text-white mb-0.5">
                            {reflection.feelingTags?.length || 0}
                          </div>
                          <div className="text-xs text-gray-400 font-medium">Feelings</div>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded-lg border border-white/10">
                          <div className="text-lg font-bold text-white mb-0.5">
                            {reflection.contextTags?.length || 0}
                          </div>
                          <div className="text-xs text-gray-400 font-medium">Context</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Fixed at bottom */}
                  <div className="flex space-x-3 pt-2 flex-shrink-0">
                    <Button
                      onClick={() => {
                        setSelectedDate(null)
                        setShowMoodDialog(true)
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-500/30 to-purple-600/30 hover:from-purple-500/40 hover:to-purple-600/40 border border-purple-400/40 text-white rounded-xl py-2.5 text-sm font-semibold shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      onClick={() => setSelectedDate(null)}
                      className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-105"
                    >
                      ✓ Close
                    </Button>
                  </div>
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
} 