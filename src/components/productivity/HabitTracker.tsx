'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Flame } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'

interface Habit {
  id: string
  name: string
  completed: boolean
  emoji?: string
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: 'no-snus', name: 'No snus today', completed: false, emoji: '🚭' },
    { id: 'workout', name: 'Workout completed', completed: false, emoji: '💪' },
    { id: 'shipped', name: 'Shipped something', completed: false, emoji: '🚀' },
    { id: 'hydrated', name: 'Drank enough water', completed: false, emoji: '💧' },
    { id: 'learning', name: 'Learned something new', completed: false, emoji: '📚' },
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
    
    // Check if all habits are completed
    const allCompleted = updatedHabits.every(habit => habit.completed)
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
  
  // Get progress class based on completion
  const getProgressClass = () => {
    const percentage = Math.round(completionPercentage / 20) * 20; // Round to nearest 20%
    switch (percentage) {
      case 0: return 'w-0';
      case 20: return 'w-1/5';
      case 40: return 'w-2/5'; 
      case 60: return 'w-3/5';
      case 80: return 'w-4/5';
      case 100: return 'w-full';
      default: return 'w-0';
    }
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Daily Habits</h3>
          {streak > 0 && (
            <div className="flex items-center space-x-1 text-orange-400">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-medium">{streak} day streak</span>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Progress</span>
            <span>{completedCount}/{habits.length}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 relative overflow-hidden">
            <div 
              className={`bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ${getProgressClass()}`}
            />
          </div>
        </div>

        {/* Habit List */}
        <div className="space-y-3">
          {habits.map((habit) => (
            <Button
              key={habit.id}
              variant="ghost"
              className="w-full justify-start p-3 h-auto hover:bg-gray-700/50"
              onClick={() => toggleHabit(habit.id)}
            >
              <div className="flex items-center space-x-3">
                {habit.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-lg">{habit.emoji}</span>
                <span className={`text-sm ${habit.completed ? 'text-green-400 line-through' : 'text-gray-200'}`}>
                  {habit.name}
                </span>
              </div>
            </Button>
          ))}
        </div>

        {/* Completion Message */}
        {completedCount === habits.length && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
            <p className="text-green-400 text-sm text-center">
              🎉 All habits completed! You&apos;re crushing it today!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 