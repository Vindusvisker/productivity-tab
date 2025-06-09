'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Heart, Calendar, TrendingUp, Edit3 } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import MoodSlider from './MoodSlider'

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

  useEffect(() => {
    initializeReflection()
  }, [])

  const initializeReflection = async () => {
    await loadReflections()
    setCurrentPrompt(getWeeklyPrompt())
    
    // Check if today's reflection exists
    const today = new Date().toISOString().split('T')[0]
    const saved = await storage.load('weekly-reflections') || {}
    const todayReflection = saved[today]
    
    if (!todayReflection || todayReflection.mood === undefined) {
      // No today's data - show mood dialog after a short delay
      setTimeout(() => setShowMoodDialog(true), 1000)
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
    const today = new Date()
    const startOfWeek = new Date(today)
    const dayOfWeek = today.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startOfWeek.setDate(today.getDate() - daysFromMonday)
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
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
          {/* Weekly Mood Chart */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              This Week
            </h3>
            
            <div className="space-y-3">
              {/* Mood Chart */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Mood</span>
                  <Heart className="h-3 w-3 text-pink-400" />
                </div>
                <div className="flex space-x-1">
                  {weekDates.map((date, index) => {
                    const reflection = reflections[date]
                    const mood = reflection?.mood
                    const intensity = mood !== undefined ? (mood + 1) / 7 : 0 // Convert 0-6 to 0-1
                    
                    return (
                      <div key={date} className="flex-1 text-center">
                        <div 
                          className={`h-8 rounded-sm cursor-pointer hover:opacity-80 transition-opacity ${
                            mood !== undefined ? 'bg-pink-500' : 'bg-gray-700'
                          }`}
                          style={{ opacity: mood !== undefined ? Math.max(0.3, intensity) : 0.3 }}
                          onClick={() => setSelectedDate(date)}
                        />
                        <span className="text-xs text-gray-500">{dayNames[index][0]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Insights Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
            <div className="text-xs text-gray-400 mb-1">Weekly Insights</div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {generateInsights()}
            </p>
          </div>

          {/* Journal Prompt */}
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-2 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              This Week's Reflection
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-xs text-purple-300 mb-2 italic">"{currentPrompt}"</p>
              <textarea
                value={weeklyNote}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => saveWeeklyNote(e.target.value)}
                placeholder="Write your thoughts..."
                className="w-full bg-transparent border-none text-xs text-gray-300 placeholder-gray-500 resize-none h-16 p-0 focus:outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mood Slider Dialog - iPhone-sized centered modal */}
      {showMoodDialog && (
        <Dialog open={showMoodDialog} onOpenChange={setShowMoodDialog}>
          <DialogContent className="max-w-sm w-[375px] h-[667px] p-0 border-none bg-transparent overflow-hidden rounded-3xl">
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
          <DialogContent className="bg-black/90 border border-white/20 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center space-x-2">
                <Heart className="h-4 w-4 text-pink-400" />
                <span>Daily Reflection</span>
              </DialogTitle>
              <p className="text-sm text-gray-400">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-300 mb-4">Use the Apple Health-style mood tracker for the best experience</p>
                <Button
                  onClick={() => {
                    setSelectedDate(null)
                    setShowMoodDialog(true)
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-xl"
                >
                  Update Today's Reflection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
} 