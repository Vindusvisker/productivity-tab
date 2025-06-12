'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, CheckCircle, Flame, TrendingUp } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import DayDetailsDialog from './DayDetailsDialog'
import PowerGrid from '@/components/personal/PowerGrid'
import { UserConfig } from '../../types/UserConfig'

interface WeeklyOverviewProps {
  userConfig?: UserConfig | null
}

type DailyLog = {
  date: string
  habitsCompleted: number
  focusSessions: number
  snusCount: number
  completedHabits?: string[]
}

interface DayActivity {
  date: string
  habits: string[]
  focusSessions: number
  snusStatus: 'success' | 'failed' | 'pending'
  snusCount: number
  allHabitsCompleted: boolean
}

interface Habit {
  id: string
  name: string
  completed: boolean
  iconName: string
}

interface SnusData {
  dailyCount: number
  totalDays: number
  successfulDays: number
  failedDays: number
  currentStreak: number
  lastDate: string
}

export default function WeeklyOverview({ userConfig }: WeeklyOverviewProps) {
  const [weekData, setWeekData] = useState<DayActivity[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Get display name for the habit
  const getHabitName = () => {
    if (!userConfig?.hasAddiction) return 'Habit'
    
    if (userConfig.addictionName) {
      return userConfig.addictionName
    }
    
    switch (userConfig.addictionType) {
      case 'snus': return 'Snus'
      case 'tobacco': return 'Cigarette'  
      case 'alcohol': return 'Drink'
      case 'gambling': return 'Gambling'
      case 'other': return 'Habit'
      default: return 'Snus'
    }
  }

  // Get emoji for habit type
  const getHabitEmoji = () => {
    if (!userConfig?.hasAddiction) return '🚭'
    
    switch (userConfig.addictionType) {
      case 'snus': return '🚭'
      case 'tobacco': return '🚬'
      case 'alcohol': return '🍺'
      case 'gambling': return '🎰'
      case 'other': return '🎯'
      default: return '🚭'
    }
  }

  useEffect(() => {
    loadWeeklyData()
    
    // Listen for daily logs updates from other components (debounced to prevent flickering)
    let updateTimeout: NodeJS.Timeout | null = null
    
    const handleDailyLogsUpdate = () => {
      // Debounce rapid updates to prevent flickering
      if (updateTimeout) {
        clearTimeout(updateTimeout)
      }
      
      updateTimeout = setTimeout(() => {
        loadWeeklyData()
      }, 300) // Wait 300ms before updating to batch rapid changes
    }
    
    window.addEventListener('dailyLogsUpdated', handleDailyLogsUpdate)
    
    // Only check for day changes, not constant polling
    const checkDayChange = () => {
      const today = new Date().toDateString()
      const lastCheckedDate = localStorage.getItem('weekly-overview-date')
      
      if (lastCheckedDate !== today) {
        localStorage.setItem('weekly-overview-date', today)
        loadWeeklyData()
      }
    }
    
    // Check for day change every 30 seconds instead of constant polling
    const dayChangeInterval = setInterval(checkDayChange, 30000)
    
    return () => {
      window.removeEventListener('dailyLogsUpdated', handleDailyLogsUpdate)
      clearInterval(dayChangeInterval)
      if (updateTimeout) clearTimeout(updateTimeout)
    }
  }, [])

  const saveCurrentDayData = async () => {
    const today = new Date().toDateString()
    const todayISO = new Date().toISOString().split('T')[0] // ISO format for daily-logs
    
    // Check if today's data was manually edited recently (within last 5 minutes)
    // If so, don't overwrite it with automatic data
    const existingDayData = await storage.load(`day-data-${today}`)
    const existingDailyLog = await storage.load('daily-logs') || {}
    
    // If we have manually edited data for today, preserve it
    if (existingDayData && existingDayData.lastManualEdit) {
      const lastEdit = new Date(existingDayData.lastManualEdit)
      const now = new Date()
      const timeDiff = now.getTime() - lastEdit.getTime()
      
      // If edited within last 5 minutes, don't overwrite
      if (timeDiff < 5 * 60 * 1000) {
        return existingDayData
      }
    }
    
    // Get current habits data
    const currentHabits: Habit[] = await storage.load('habits') || []
    const completedHabits = currentHabits.filter(habit => habit.completed)
    const allHabitsCompleted = currentHabits.length > 0 && completedHabits.length === currentHabits.length
    
    // Get current focus sessions
    const focusSessions = await storage.load('focus-sessions') || 0
    
    // Get snus data to determine status
    const snusData: SnusData = await storage.load('snus-data') || {
      dailyCount: 0,
      totalDays: 0,
      successfulDays: 0,
      failedDays: 0,
      currentStreak: 0,
      lastDate: ''
    }
    
    // Determine the actual snus count for today
    let actualSnusCount = snusData.dailyCount
    let snusStatus: 'success' | 'failed' | 'pending' = 'pending'
    const SNUS_DAILY_LIMIT = 5
    
    if (snusData.lastDate === today) {
      // Day is in progress - use current count
      actualSnusCount = snusData.dailyCount
      if (actualSnusCount === 0) {
        snusStatus = 'success' // Clean day so far
      } else if (actualSnusCount <= SNUS_DAILY_LIMIT) {
        snusStatus = 'pending' // Within limit but not clean
      } else {
        snusStatus = 'failed' // Over limit
      }
    } else {
      // New day or different day - check if we have existing data
      
      if (existingDayData && typeof existingDayData.snusCount === 'number') {
        // Use existing legacy data
        actualSnusCount = existingDayData.snusCount
        snusStatus = existingDayData.snusStatus || 'pending'
      } else if (existingDailyLog[todayISO] && typeof existingDailyLog[todayISO].snusCount === 'number') {
        // Use existing unified data
        actualSnusCount = existingDailyLog[todayISO].snusCount
        if (actualSnusCount === 0) {
          snusStatus = 'success'
        } else if (actualSnusCount <= SNUS_DAILY_LIMIT) {
          snusStatus = 'pending'
        } else {
          snusStatus = 'failed'
        }
      } else {
        // No existing data - start fresh (this is truly a new day)
        actualSnusCount = snusData.dailyCount // Should be 0 for new day
        snusStatus = actualSnusCount === 0 ? 'success' : 'pending'
      }
    }
    
    // Save to unified daily-logs format (same as JourneyHeatmap)
    const dailyLogsData = await storage.load('daily-logs') || {}
    
    // Only update if we don't have existing data or if it's incomplete
    if (!dailyLogsData[todayISO] || !dailyLogsData[todayISO].snusCount) {
      dailyLogsData[todayISO] = {
        date: todayISO,
        habitsCompleted: completedHabits.length,
        focusSessions: focusSessions,
        snusCount: actualSnusCount,
        ...(dailyLogsData[todayISO] || {}) // Preserve any existing data like completedHabits
      }
      await storage.save('daily-logs', dailyLogsData)
    }
    
    // Also save legacy format for WeeklyOverview display
    const dayData = {
      date: today,
      habits: completedHabits.map(h => h.name),
      focusSessions: focusSessions,
      snusStatus: snusStatus,
      snusCount: actualSnusCount,
      allHabitsCompleted: allHabitsCompleted,
      ...(existingDayData || {}) // Preserve existing data
    }
    
    await storage.save(`day-data-${today}`, dayData)
    
    // Trigger updates to other components
    window.dispatchEvent(new CustomEvent('dailyLogsUpdated'))
    
    return dayData
  }

  const loadWeeklyData = async () => {
    try {
      const days: DayActivity[] = []
      const today = new Date()
      
      // Load unified daily logs data from JourneyHeatmap
      const dailyLogsData = await storage.load('daily-logs') || {}
      
      // Only save current day data if it's today and we don't have recent manual edits
      const todayDate = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const dateString = date.toDateString()
        const isoDateString = date.toISOString().split('T')[0] // ISO format for daily-logs
        
        // For today only, save current data if needed
        if (i === 0) {
          await saveCurrentDayData()
        }
        
        // Try to load saved day data first (legacy format)
        let dayData = await storage.load(`day-data-${dateString}`)
        
        if (!dayData) {
          // Check unified daily-logs format from JourneyHeatmap
          const unifiedLog = dailyLogsData[isoDateString]
          
          if (unifiedLog) {
            // Convert unified format to WeeklyOverview format
            const SNUS_DAILY_LIMIT = 5
            let snusStatus: 'success' | 'failed' | 'pending' = 'pending'
            
            // Ensure snusCount is a valid number
            const snusCount = typeof unifiedLog.snusCount === 'number' ? unifiedLog.snusCount : 0
            
            if (snusCount === 0) {
              snusStatus = 'success' // Clean day
            } else if (snusCount <= SNUS_DAILY_LIMIT) {
              snusStatus = 'pending' // Within limit but not clean
            } else {
              snusStatus = 'failed' // Over limit
            }
            
            // Use actual habit names if available, otherwise create generic ones
            let habitNames: string[]
            if (unifiedLog.completedHabits && unifiedLog.completedHabits.length > 0) {
              habitNames = unifiedLog.completedHabits
            } else {
              // Fallback to generic names if no specific habits stored
              habitNames = []
              for (let h = 0; h < unifiedLog.habitsCompleted; h++) {
                habitNames.push(`Habit ${h + 1}`)
              }
            }
            
            dayData = {
              date: dateString,
              habits: habitNames,
              focusSessions: unifiedLog.focusSessions || 0,
              snusStatus: snusStatus,
              snusCount: snusCount,
              allHabitsCompleted: false // Never claim "all" for backfilled data since we don't know the total
            }
          } else {
            // Past days with no data - create empty data
            dayData = {
              date: dateString,
              habits: [],
              focusSessions: 0,
              snusStatus: 'pending' as const,
              snusCount: 0,
              allHabitsCompleted: false
            }
          }
        }
        
        // Ensure snusCount is always a valid number
        if (dayData && typeof dayData.snusCount !== 'number') {
          dayData.snusCount = 0
        }
        
        days.push(dayData)
      }
      
      setWeekData(days)
      
      // Calculate current streak using same logic as PowerGrid
      const currentStreak = calculateCurrentStreak(Object.values(dailyLogsData))
      setCurrentStreak(currentStreak)
      
    } catch (error) {
      console.error('Error loading weekly data:', error)
    }
  }

  // Use same streak calculation logic as PowerGrid
  const calculateCurrentStreak = (logs: DailyLog[]): number => {
    if (logs.length === 0) return 0
    
    // Sort logs by date (newest first)
    const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    const today = new Date().toISOString().split('T')[0]
    
    let streak = 0
    
    // Use same scoring system as PowerGrid: habits×2 + focus×1 - snus×1 >= 3
    const getScore = (log: DailyLog) => log.habitsCompleted * 2 + log.focusSessions * 1 - log.snusCount * 1
    
    for (const log of sortedLogs) {
      const score = getScore(log)
      const isToday = log.date === today
      
      // Skip today if it has a low score (day might not be complete)
      if (isToday && score < 3) {
        continue
      }
      
      if (score >= 3) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  // Removed conflicting polling interval that was causing flickering:
  // - No more 5-second polling for storage changes
  // - Event-driven updates are sufficient and more efficient
  // - Day changes are still monitored with a longer interval

  const getDayName = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === new Date(today.getTime() - 86400000).toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString([], { weekday: 'long' })
    }
  }

  const getSuccessRate = () => {
    const completedDays = weekData.filter(day => {
      const hasGoodHabits = day.allHabitsCompleted || day.habits.length >= 3
      const hasGoodSnus = day.snusStatus === 'success' || (day.snusStatus === 'pending' && day.habits.includes('No Snus'))
      return hasGoodHabits && hasGoodSnus
    }).length
    return weekData.length > 0 ? Math.round((completedDays / weekData.length) * 100) : 0
  }

  const handleDayClick = (day: DayActivity) => {
    setSelectedDay(day)
    setIsDialogOpen(true)
  }

  return (
    <Card className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
      <CardContent className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">This Week</h2>
            <p className="text-sm text-gray-400">Your progress overview</p>
          </div>
          
          {/* Stats */}
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400">{currentStreak}</div>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{getSuccessRate()}%</div>
              <div className="text-xs text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Weekly Log */}
        <div className="space-y-3">
          {weekData.map((day, index) => (
            <div
              key={day.date}
              onClick={() => handleDayClick(day)}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all cursor-pointer hover:border-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      day.snusStatus === 'success' ? 'bg-green-400' :
                      day.snusStatus === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    {/* Snus Count Display */}
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      day.snusStatus === 'success' ? 'bg-green-500/20 text-green-400' :
                      day.snusStatus === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {userConfig?.hasAddiction ? (
                        (typeof day.snusCount === 'number' && day.snusCount === 0) ? getHabitEmoji() : 
                        (typeof day.snusCount === 'number' && day.snusCount > 0) ? `${day.snusCount} ${getHabitName().toLowerCase()}` : 
                        `0 ${getHabitName().toLowerCase()}`
                      ) : (
                        '🌟 No tracking'
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white flex items-center">
                      🗓️ {getDayName(day.date)}
                      {day.allHabitsCompleted && (
                        <span className="ml-2 text-green-400">✨</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {day.habits.length > 0 ? (
                        day.allHabitsCompleted ? (
                          // Clean summary when all habits completed
                          <span className="text-green-400 font-medium">
                            🎯 All {day.habits.length} habits completed
                          </span>
                        ) : day.habits.length <= 2 ? (
                          // Show individual habits if 2 or fewer
                          day.habits.map((habit, idx) => (
                            <span key={idx} className="mr-2">
                              ✅ {habit}
                            </span>
                          ))
                        ) : (
                          // Show compact summary for partial completion
                          <span className="text-blue-400">
                            ✅ {day.habits.length} habits completed
                          </span>
                        )
                      ) : (
                        <span className="text-gray-500">No activities logged</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {day.focusSessions > 0 && (
                  <div className="flex items-center space-x-1 text-blue-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">{day.focusSessions} focus</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>


        {/* Power Stats */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center">
            <span className="mr-2">⚡</span>
            Power Stats
          </h3>
          <PowerGrid />
        </div>
      </CardContent>

      {/* Day Details Dialog */}
      <DayDetailsDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        dayData={selectedDay}
        userConfig={userConfig}
      />
    </Card>
  )
} 