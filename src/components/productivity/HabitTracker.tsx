'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Circle, Flame, Dumbbell, Sun, BookOpen, Droplets, Utensils, X, Plus, Edit3, Trash2, Check } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'

interface Habit {
  id: string
  name: string
  completed: boolean
  iconName: string
}

// Default habits - only used on first time setup
const DEFAULT_HABITS: Habit[] = [
  { id: 'workout1', name: 'First Workout', completed: false, iconName: 'Dumbbell' },
  { id: 'alcohol', name: 'No Alcohol', completed: false, iconName: 'X' },
  { id: 'workout2', name: 'Second Workout', completed: false, iconName: 'Sun' },
  { id: 'reading', name: 'Read 10 pages', completed: false, iconName: 'BookOpen' },
  { id: 'diet', name: 'Follow a healthy diet', completed: false, iconName: 'Utensils' },
  { id: 'water', name: 'Drink water', completed: false, iconName: 'Droplets' },
]

// Icon mapping
const iconMap = {
  Dumbbell,
  X,
  Sun,
  BookOpen,
  Utensils,
  Droplets,
  Plus,
  Flame,
  Circle,
}

// Available icons for selection
const availableIcons = ['Dumbbell', 'X', 'Sun', 'BookOpen', 'Utensils', 'Droplets', 'Flame', 'Circle']

export default function HabitTracker() {
  // Start with empty array - will be populated from storage or defaults
  const [habits, setHabits] = useState<Habit[]>([])
  const [streak, setStreak] = useState(0)
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingHabit, setEditingHabit] = useState<string | null>(null)
  const [newHabitName, setNewHabitName] = useState('')

  // Load data on mount
  useEffect(() => {
    initializeHabits()
  }, [])

  // Check if we need to reset daily (new day)
  useEffect(() => {
    if (habits.length === 0) return // Don't run until habits are loaded
    
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
  }, [habits])

  const initializeHabits = async () => {
    try {
      setIsLoading(true)
      
      // Try to load existing habit structure from storage
      const savedHabitStructure = await storage.load('habit-structure')
      const savedHabits = await storage.load('habits')
      const savedStreak = await storage.load('habit-streak')
      const savedLastDate = await storage.load('last-completed-date')
      
      let habitsToUse: Habit[] = []
      
      if (savedHabitStructure) {
        // Use saved habit structure (preserves custom habits)
        habitsToUse = savedHabitStructure
        console.log('Loaded habit structure from storage:', habitsToUse)
      } else if (savedHabits) {
        // Legacy: migrate old habits format
        habitsToUse = savedHabits
        await storage.save('habit-structure', habitsToUse)
        console.log('Migrated habits to new structure:', habitsToUse)
      } else {
        // First time setup: use defaults
        habitsToUse = DEFAULT_HABITS
        await storage.save('habit-structure', habitsToUse)
        console.log('First time setup with defaults:', habitsToUse)
      }
      
      // Load today's completion status
      const today = new Date().toDateString()
      const todayData = await storage.load(`day-data-${today}`)
      
      if (todayData && todayData.habits) {
        // Mark habits as completed based on today's data
        habitsToUse = habitsToUse.map(habit => ({
          ...habit,
          completed: todayData.habits.includes(habit.name)
        }))
      } else {
        // Reset all to uncompleted for new day
        habitsToUse = habitsToUse.map(habit => ({
          ...habit,
          completed: false
        }))
      }
      
      setHabits(habitsToUse)
      await storage.save('habits', habitsToUse)
      
      if (savedStreak) {
        setStreak(savedStreak)
      }
      if (savedLastDate) {
        setLastCompletedDate(savedLastDate)
      }
    } catch (error) {
      console.error('Error initializing habits:', error)
      // Fallback to defaults on error
      setHabits(DEFAULT_HABITS)
    } finally {
      setIsLoading(false)
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
        snusStatus: 'pending' as const,
        allHabitsCompleted: completedHabits.length === habits.length
      }
      await storage.save(`day-data-${yesterday}`, yesterdayData)
    }
    
    // Reset completion status but preserve habit structure
    const resetHabits = habits.map(habit => ({ ...habit, completed: false }))
    setHabits(resetHabits)
    await storage.save('habits', resetHabits)
    
    console.log('Daily habits reset for new day')
  }

  const saveHabitStructure = async (newHabits: Habit[]) => {
    await storage.save('habit-structure', newHabits)
    await storage.save('habits', newHabits)
  }

  const addNewHabit = async () => {
    if (!newHabitName.trim()) return
    
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: newHabitName.trim(),
      completed: false,
      iconName: 'Circle'
    }
    
    const updatedHabits = [...habits, newHabit]
    setHabits(updatedHabits)
    await saveHabitStructure(updatedHabits)
    setNewHabitName('')
  }

  const removeHabit = async (habitId: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== habitId)
    setHabits(updatedHabits)
    await saveHabitStructure(updatedHabits)
  }

  const updateHabitName = async (habitId: string, newName: string) => {
    if (!newName.trim()) return
    
    const updatedHabits = habits.map(habit =>
      habit.id === habitId ? { ...habit, name: newName.trim() } : habit
    )
    setHabits(updatedHabits)
    await saveHabitStructure(updatedHabits)
    setEditingHabit(null)
  }

  const updateHabitIcon = async (habitId: string, newIcon: string) => {
    const updatedHabits = habits.map(habit =>
      habit.id === habitId ? { ...habit, iconName: newIcon } : habit
    )
    setHabits(updatedHabits)
    await saveHabitStructure(updatedHabits)
  }

  const toggleHabit = async (habitId: string) => {
    if (isEditMode) return // Don't toggle in edit mode
    
    const updatedHabits = habits.map(habit => 
      habit.id === habitId ? { ...habit, completed: !habit.completed } : habit
    )
    
    setHabits(updatedHabits)
    await storage.save('habits', updatedHabits)
    
    // Save current day data for real-time tracking
    const today = new Date().toISOString().split('T')[0]
    const completedHabits = updatedHabits.filter(habit => habit.completed)
    const allCompleted = completedHabits.length === updatedHabits.length
    
    // Get current focus sessions and snus count
    const focusSessions = await storage.load('focus-sessions') || 0
    const snusData = await storage.load('snus-data') || { dailyCount: 0 }
    
    // Save to unified daily-logs format
    const dailyLogsData = await storage.load('daily-logs') || {}
    dailyLogsData[today] = {
      date: today,
      habitsCompleted: completedHabits.length,
      focusSessions: focusSessions,
      snusCount: snusData.dailyCount,
      completedHabits: completedHabits.map(h => h.name)
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

  // Show loading state
  if (isLoading) {
    return (
      <Card className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-40">
            <div className="text-white/70">Loading habits...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const completedCount = habits.filter(habit => habit.completed).length
  const completionPercentage = habits.length > 0 ? (completedCount / habits.length) * 100 : 0
  
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
            <p className="text-gray-400 text-lg">
              {completedCount === habits.length && habits.length > 0 
                ? "Perfect day! 🎉" 
                : "Great start to the day"}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Edit Mode Toggle */}
            <button
              onClick={() => {
                setIsEditMode(!isEditMode)
                setEditingHabit(null)
                setNewHabitName('')
              }}
              className={`p-3 rounded-full transition-all duration-200 ${
                isEditMode 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Edit3 className="h-4 w-4" />
            </button>
            
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
        </div>

        {/* Add New Habit (Edit Mode) */}
        {isEditMode && (
          <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Enter new habit name..."
                className="flex-1 bg-black/30 text-white placeholder-white/50 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:border-blue-400"
                onKeyPress={(e) => e.key === 'Enter' && addNewHabit()}
              />
              <button
                onClick={addNewHabit}
                disabled={!newHabitName.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Habit Pills Grid */}
        <div className={`grid gap-4 ${
          habits.length > 6 ? 'grid-cols-3' : 'grid-cols-2'
        }`}>
          {habits.map((habit) => {
            const Icon = iconMap[habit.iconName as keyof typeof iconMap] || Circle
            const isEditing = editingHabit === habit.id
            const isCompact = habits.length > 6
            
            return (
              <div key={habit.id} className="relative">
                {/* Main Habit Button */}
                <button
                  onClick={() => !isEditMode && toggleHabit(habit.id)}
                  className={`relative flex items-center space-x-3 rounded-full transition-all duration-200 w-full ${
                    isCompact ? 'px-4 py-3' : 'px-6 py-4'
                  } ${
                    isEditMode ? 'cursor-default' : 'hover:scale-105'
                  } ${
                    habit.completed && !isEditMode
                      ? 'bg-white text-black shadow-lg' 
                      : 'bg-gray-800/60 text-white/70 hover:bg-gray-700/60'
                  }`}
                >
                  {/* Icon with click to change in edit mode */}
                  <div 
                    className={`rounded-full ${
                      isCompact ? 'p-1.5' : 'p-2'
                    } ${
                      habit.completed && !isEditMode ? 'bg-black' : 'bg-white/20'
                    } ${isEditMode ? 'cursor-pointer' : ''}`}
                    onClick={isEditMode ? (e) => {
                      e.stopPropagation()
                      // Cycle through available icons
                      const currentIndex = availableIcons.indexOf(habit.iconName)
                      const nextIndex = (currentIndex + 1) % availableIcons.length
                      updateHabitIcon(habit.id, availableIcons[nextIndex])
                    } : undefined}
                  >
                    <Icon className={`${
                      isCompact ? 'h-4 w-4' : 'h-5 w-5'
                    } ${
                      habit.completed && !isEditMode ? 'text-white' : 'text-white/70'
                    }`} />
                  </div>
                  
                  {/* Habit Name */}
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={habit.name}
                      autoFocus
                      onBlur={(e) => updateHabitName(habit.id, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateHabitName(habit.id, e.currentTarget.value)
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`flex-1 bg-transparent font-medium text-left border-none outline-none ${
                        isCompact ? 'text-xs' : 'text-sm'
                      }`}
                    />
                  ) : (
                    <span 
                      className={`font-medium flex-1 text-left ${
                        isCompact ? 'text-xs' : 'text-sm'
                      } ${
                        habit.completed && !isEditMode ? 'text-black' : 'text-white/90'
                      } ${isEditMode ? 'cursor-pointer' : ''}`}
                      onClick={isEditMode ? (e) => {
                        e.stopPropagation()
                        setEditingHabit(habit.id)
                      } : undefined}
                    >
                      {habit.name}
                    </span>
                  )}
                  
                  {/* Completion Check */}
                  {habit.completed && !isEditMode && (
                    <CheckCircle className={`text-black ml-auto ${
                      isCompact ? 'h-5 w-5' : 'h-6 w-6'
                    }`} />
                  )}
                </button>
                
                {/* Delete Button (Edit Mode) */}
                {isEditMode && (
                  <button
                    onClick={() => removeHabit(habit.id)}
                    className={`absolute bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg ${
                      isCompact ? '-top-1 -right-1 p-1' : '-top-2 -right-2 p-1.5'
                    }`}
                  >
                    <Trash2 className={isCompact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 