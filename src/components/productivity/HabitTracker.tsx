'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Flame, Dumbbell, Sun, BookOpen, Droplets, Utensils, X } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'

interface Habit {
  id: string
  name: string
  completed: boolean
  iconName: string
}

// Icon mapping
const iconMap = {
  Dumbbell,
  X,
  Sun,
  BookOpen,
  Utensils,
  Droplets,
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: 'workout1', name: 'First Workout', completed: true, iconName: 'Dumbbell' },
    { id: 'alcohol', name: 'No Alcohol', completed: false, iconName: 'X' },
    { id: 'workout2', name: 'Second Workout', completed: true, iconName: 'Sun' },
    { id: 'reading', name: 'Read 10 pages', completed: true, iconName: 'BookOpen' },
    { id: 'diet', name: 'Follow a healthy diet', completed: false, iconName: 'Utensils' },
    { id: 'water', name: 'Drink water', completed: false, iconName: 'Droplets' },
  ])
  
  const [streak, setStreak] = useState(0)
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(null)

  // Load data on mount
  useEffect(() => {
    loadHabits()
  }, [])

  // Check if we need to reset daily (new day)
  useEffect(() => {
    const checkAndReset = () => {
      const today = new Date().toDateString()
      const savedDate = localStorage.getItem('habit-date')
      
      if (savedDate !== today) {
        resetDailyHabits()
        localStorage.setItem('habit-date', today)
      }
    }

    checkAndReset()
    // Check every minute for date change
    const interval = setInterval(checkAndReset, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadHabits = async () => {
    try {
      const savedHabits = await storage.load('habits')
      const savedStreak = await storage.load('habit-streak')
      const savedLastDate = await storage.load('last-completed-date')
      
      if (savedHabits) {
        setHabits(savedHabits)
      }
      if (savedStreak) {
        setStreak(savedStreak)
      }
      if (savedLastDate) {
        setLastCompletedDate(savedLastDate)
      }
    } catch (error) {
      console.error('Error loading habits:', error)
    }
  }

  const resetDailyHabits = async () => {
    const today = new Date().toDateString()
    
    // Before resetting, save yesterday's completed habits if it was a successful day
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const completedHabits = habits.filter(habit => habit.completed)
    
    if (completedHabits.length > 0) {
      const yesterdayData = {
        date: yesterday,
        habits: completedHabits.map(h => h.name),
        focusSessions: await storage.load('focus-sessions') || 0,
        snusStatus: 'pending' as const, // Will be determined by WeeklyOverview
        allHabitsCompleted: completedHabits.length === habits.length
      }
      await storage.save(`day-data-${yesterday}`, yesterdayData)
    }
    
    const resetHabits = habits.map(habit => ({ ...habit, completed: false }))
    setHabits(resetHabits)
    await storage.save('habits', resetHabits)
  }

  const toggleHabit = async (habitId: string) => {
    const updatedHabits = habits.map(habit => 
      habit.id === habitId ? { ...habit, completed: !habit.completed } : habit
    )
    
    setHabits(updatedHabits)
    await storage.save('habits', updatedHabits)
    
    // Save current day data for real-time tracking
    const today = new Date().toISOString().split('T')[0] // Use ISO date format like JourneyHeatmap
    const completedHabits = updatedHabits.filter(habit => habit.completed)
    const allCompleted = completedHabits.length === updatedHabits.length
    
    // Get current focus sessions and snus count
    const focusSessions = await storage.load('focus-sessions') || 0
    const snusData = await storage.load('snus-data') || { dailyCount: 0 }
    
    // Save to unified daily-logs format (same as JourneyHeatmap)
    const dailyLogsData = await storage.load('daily-logs') || {}
    dailyLogsData[today] = {
      date: today,
      habitsCompleted: completedHabits.length,
      focusSessions: focusSessions,
      snusCount: snusData.dailyCount
    }
    await storage.save('daily-logs', dailyLogsData)
    
    // Also keep legacy format for WeeklyOverview compatibility
    const todayLegacy = new Date().toDateString()
    const todayData = {
      date: todayLegacy,
      habits: completedHabits.map(h => h.name),
      focusSessions: focusSessions,
      snusStatus: 'pending' as const,
      snusCount: snusData.dailyCount,
      allHabitsCompleted: allCompleted
    }
    await storage.save(`day-data-${todayLegacy}`, todayData)
    
    // Save detailed habit completion data with timestamps
    const habitDetails = updatedHabits.map(habit => ({
      ...habit,
      completedAt: habit.completed ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
    }))
    await storage.save(`habit-details-${todayLegacy}`, habitDetails)
    
    // Trigger updates to other components
    window.dispatchEvent(new CustomEvent('dailyLogsUpdated'))
    
    // Check if all habits are completed
    if (allCompleted) {
      await updateStreak()
    }
  }

  const updateStreak = async () => {
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    if (lastCompletedDate === yesterday || lastCompletedDate === null) {
      // Continue or start streak
      const newStreak = streak + 1
      setStreak(newStreak)
      setLastCompletedDate(today)
      await storage.save('habit-streak', newStreak)
      await storage.save('last-completed-date', today)
    } else if (lastCompletedDate !== today) {
      // Reset streak
      setStreak(1)
      setLastCompletedDate(today)
      await storage.save('habit-streak', 1)
      await storage.save('last-completed-date', today)
    }
  }

  const completedCount = habits.filter(habit => habit.completed).length
  const completionPercentage = (completedCount / habits.length) * 100
  
  // Calculate stroke dash array for circular progress
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference

  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
      <CardContent className="p-8">
        {/* Header with circular progress */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-3xl font-semibold text-white mb-2">Tasks</h2>
            <p className="text-gray-400 text-lg">Great start to the day</p>
          </div>
          
          {/* Circular Progress Indicator */}
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="text-white transition-all duration-300 ease-in-out"
                strokeLinecap="round"
              />
            </svg>
            {/* Progress text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-xl font-semibold">
                {completedCount}/{habits.length}
              </span>
            </div>
          </div>
        </div>

        {/* Habit Pills Grid */}
        <div className="grid grid-cols-2 gap-4">
          {habits.map((habit) => {
            const Icon = iconMap[habit.iconName as keyof typeof iconMap] || Circle
            return (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`relative flex items-center space-x-4 px-6 py-4 rounded-full transition-all duration-200 hover:scale-105 ${
                  habit.completed 
                    ? 'bg-white text-black shadow-lg' 
                    : 'bg-gray-800/60 text-white/70 hover:bg-gray-700/60'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  habit.completed ? 'bg-black' : 'bg-white/20'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    habit.completed ? 'text-white' : 'text-white/70'
                  }`} />
                </div>
                <span className={`text-sm font-medium flex-1 text-left ${
                  habit.completed ? 'text-black' : 'text-white/90'
                }`}>
                  {habit.name}
                </span>
                {habit.completed && (
                  <CheckCircle className="h-6 w-6 text-black ml-auto" />
                )}
              </button>
            )
          })}
          
          {/* Completion Celebration Pill */}
          {completedCount === habits.length && (
            <div className="col-span-2 flex items-center justify-center px-6 py-4 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 backdrop-blur-sm">
              <span className="text-green-400 text-sm font-medium">
                🎉 All tasks completed! You're crushing it today!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 