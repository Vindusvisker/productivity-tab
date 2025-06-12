'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Calendar, Target, Clock, Ban, Save, ChevronLeft, ChevronRight } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import { UserConfig } from '../../types/UserConfig'

type DailyLog = {
  date: string
  habitsCompleted: number
  focusSessions: number
  snusCount: number
  completedHabits?: string[]
}

interface Habit {
  id: string
  name: string
  completed: boolean
  iconName: string
}

interface JourneyHeatmapProps {
  className?: string
  userConfig?: UserConfig | null
}

export default function JourneyHeatmap({ className, userConfig }: JourneyHeatmapProps) {
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({})
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [availableHabits, setAvailableHabits] = useState<string[]>([])

  useEffect(() => {
    loadDailyLogs()
    loadAvailableHabits()
    
    // Listen for updates from other components (HabitTracker, SnusTracker, FocusTimer)
    const handleDailyLogsUpdate = () => {
      loadDailyLogs()
    }
    
    window.addEventListener('dailyLogsUpdated', handleDailyLogsUpdate)
    
    return () => {
      window.removeEventListener('dailyLogsUpdated', handleDailyLogsUpdate)
    }
  }, [])

  const loadDailyLogs = async () => {
    try {
      const logs = await storage.load('daily-logs') || {}
      setDailyLogs(logs)
    } catch (error) {
      console.error('Error loading daily logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableHabits = async () => {
    try {
      const savedHabits: Habit[] = await storage.load('habits') || []
      if (savedHabits.length > 0) {
        setAvailableHabits(savedHabits.map(h => h.name))
      } else {
        // Fallback to default habits if none saved
        setAvailableHabits([
          'First Workout',
          'No Alcohol', 
          'Second Workout',
          'Read 10 pages',
          'Follow a healthy diet',
          'Drink water'
        ])
      }
    } catch (error) {
      console.error('Error loading habits:', error)
      // Fallback to default habits
      setAvailableHabits([
        'First Workout',
        'No Alcohol', 
        'Second Workout',
        'Read 10 pages',
        'Follow a healthy diet',
        'Drink water'
      ])
    }
  }

  const saveDailyLog = async (date: string, log: Omit<DailyLog, 'date'>) => {
    const updatedLogs = {
      ...dailyLogs,
      [date]: { date, ...log }
    }
    setDailyLogs(updatedLogs)
    await storage.save('daily-logs', updatedLogs)
    
    // Also save to legacy day-data format for WeeklyOverview compatibility
    const dateObj = new Date(date)
    const legacyDateString = dateObj.toDateString()
    const SNUS_DAILY_LIMIT = 5
    
    // Determine snus status based on count
    let snusStatus: 'success' | 'failed' | 'pending' = 'pending'
    if (log.snusCount === 0) {
      snusStatus = 'success'
    } else if (log.snusCount <= SNUS_DAILY_LIMIT) {
      snusStatus = 'pending'
    } else {
      snusStatus = 'failed'
    }
    
    // Load existing legacy data to preserve other fields
    const existingDayData = await storage.load(`day-data-${legacyDateString}`) || {}
    
    const legacyDayData = {
      ...existingDayData,
      date: legacyDateString,
      habits: log.completedHabits || [],
      focusSessions: log.focusSessions,
      snusStatus: snusStatus,
      snusCount: log.snusCount,
      allHabitsCompleted: false, // We don't know the total habits available when editing manually
      lastManualEdit: new Date().toISOString() // Timestamp to track manual edits
    }
    
    await storage.save(`day-data-${legacyDateString}`, legacyDayData)
    
    // Dispatch event to trigger ProfileHeader XP recalculation and WeeklyOverview updates
    window.dispatchEvent(new CustomEvent('dailyLogsUpdated'))
  }

  const getDailyScore = (log: DailyLog | undefined): number => {
    if (!log) return -999 // Special value for no data
    return Math.max(0, log.habitsCompleted * 2 + log.focusSessions * 1 - log.snusCount * 1) // Ensure minimum 0
  }

  const getScoreColor = (score: number, hasData: boolean): string => {
    if (!hasData || score === -999) return 'bg-gray-600 border-gray-700' // No data - gray
    if (score >= 5) return 'bg-green-500 border-green-600'
    if (score >= 3) return 'bg-lime-400 border-lime-500'
    if (score >= 1) return 'bg-yellow-400 border-yellow-500'
    if (score === 0) return 'bg-slate-600 border-slate-700' // Actual 0 score - dark blue
    return 'bg-red-500 border-red-600' // Negative (shouldn't happen with Math.max but just in case)
  }

  const getScoreIntensity = (score: number, hasData: boolean): string => {
    if (!hasData || score === -999) return 'opacity-20' // No data - very faint
    if (score >= 5) return 'opacity-100'
    if (score >= 3) return 'opacity-80'
    if (score >= 1) return 'opacity-60'
    if (score === 0) return 'opacity-50' // Actual 0 score - medium opacity
    return 'opacity-70'
  }

  const generateCurrentMonthDays = (): string[] => {
    const days = []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push(date.toISOString().split('T')[0])
    }
    return days
  }

  const formatDateTooltip = (date: string, log: DailyLog | undefined): string => {
    const d = new Date(date)
    const formatted = d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    if (!log) return `${formatted}\nNo activity recorded`
    
    const score = getDailyScore(log)
    return `${formatted}\n✅ ${log.habitsCompleted} habits\n⏱️ ${log.focusSessions} focus sessions\n🚫 ${log.snusCount} ${userConfig?.addictionName?.toLowerCase() || 'snus'}\nScore: ${score}`
  }

  const handleDayClick = (date: string) => {
    setSelectedDate(date)
    setEditModalOpen(true)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  const canNavigateNext = () => {
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return nextMonth <= new Date()
  }

  const DailyLogEditor = () => {
    const [editLog, setEditLog] = useState<Omit<DailyLog, 'date'>>({
      habitsCompleted: 0,
      focusSessions: 0,
      snusCount: 0,
      completedHabits: []
    })

    useEffect(() => {
      if (selectedDate) {
        const existingLog = dailyLogs[selectedDate]
        if (existingLog) {
          setEditLog({
            habitsCompleted: existingLog.habitsCompleted,
            focusSessions: existingLog.focusSessions,
            snusCount: existingLog.snusCount,
            completedHabits: existingLog.completedHabits || []
          })
        } else {
          setEditLog({ habitsCompleted: 0, focusSessions: 0, snusCount: 0, completedHabits: [] })
        }
      }
    }, [selectedDate])

    const handleHabitToggle = (habitName: string) => {
      const currentHabits = editLog.completedHabits || []
      const updatedHabits = currentHabits.includes(habitName)
        ? currentHabits.filter(h => h !== habitName)
        : [...currentHabits, habitName]
      
      setEditLog(prev => ({
        ...prev,
        completedHabits: updatedHabits,
        habitsCompleted: updatedHabits.length
      }))
    }

    const handleSave = async () => {
      if (selectedDate) {
        await saveDailyLog(selectedDate, editLog)
        setEditModalOpen(false)
        setSelectedDate(null)
      }
    }

    const selectedDateFormatted = selectedDate 
      ? new Date(selectedDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : ''

    const currentScore = getDailyScore({ date: selectedDate || '', ...editLog })
    
    // Fix date comparison to only compare date parts, not time
    const isFutureDate = selectedDate ? (() => {
      const selected = new Date(selectedDate)
      const today = new Date()
      
      // Compare only the date parts (year, month, day)
      const selectedDateOnly = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate())
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      
      return selectedDateOnly.getTime() > todayDateOnly.getTime()
    })() : false

    // Helper to get dynamic habit name
    const getHabitName = () => {
      if (!userConfig) return 'Habit'
      if (userConfig.addictionName && userConfig.addictionName.trim()) {
        return userConfig.addictionName
      }
      switch (userConfig.addictionType) {
        case 'snus': return 'Snus'
        case 'tobacco': return 'Cigarette'
        case 'alcohol': return 'Drink'
        case 'gambling': return 'Gambling'
        case 'other': return 'Habit'
        default: return 'Habit'
      }
    }

    // Helper to get dynamic icon
    const getHabitIcon = () => {
      if (!userConfig) return '🚭'
      switch (userConfig.addictionType) {
        case 'snus': return '🚭'
        case 'tobacco': return '🚬'
        case 'alcohol': return '🍺'
        case 'gambling': return '🎰'
        case 'other': return '🎯'
        default: return '🚭'
      }
    }

    return (
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-black/90 border border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              <span>Daily Log</span>
            </DialogTitle>
            <p className="text-sm text-gray-400">{selectedDateFormatted}</p>
          </DialogHeader>

          {isFutureDate ? (
            <div className="py-6 text-center">
              <div className="text-gray-400 mb-2">📅</div>
              <p className="text-gray-400">Can't log future dates</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Score Display */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Daily Score</span>
                  <span className={`text-2xl font-bold ${
                    currentScore >= 5 ? 'text-green-400' :
                    currentScore >= 3 ? 'text-lime-400' :
                    currentScore >= 1 ? 'text-yellow-400' :
                    currentScore === 0 ? 'text-gray-400' : 'text-red-400'
                  }`}>
                    {currentScore}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Habits×2 + Focus×1 - {getHabitName().toLowerCase()}×1</p>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-300 flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-400" />
                    <span>Habits Completed ({editLog.completedHabits?.length || 0})</span>
                  </Label>
                  <div className="space-y-2">
                    {availableHabits.map((habit) => (
                      <label key={habit} className="flex items-center space-x-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editLog.completedHabits?.includes(habit) || false}
                          onChange={() => handleHabitToggle(habit)}
                          className="w-4 h-4 text-green-400 bg-transparent border-gray-300 rounded focus:ring-green-400"
                        />
                        <span className="text-sm text-gray-300">{habit}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-300 flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>Focus Sessions</span>
                  </Label>
                  <Input
                    type="number"
                    value={editLog.focusSessions}
                    onChange={(e) => setEditLog(prev => ({ ...prev, focusSessions: parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white"
                    min="0"
                    max="20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-300 flex items-center space-x-2">
                    <span>{getHabitIcon()}</span>
                    <span>{getHabitName()} Count</span>
                  </Label>
                  <Input
                    type="number"
                    value={editLog.snusCount}
                    onChange={(e) => setEditLog(prev => ({ ...prev, snusCount: parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white"
                    min="0"
                    max="50"
                  />
                </div>
              </div>

              {/* Save Button */}
              <Button 
                onClick={handleSave} 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Daily Log
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  const calendarDays = generateCurrentMonthDays()
  const currentMonthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-black/70 to-black/60 backdrop-blur-xl border border-white/10 h-full">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <div className="text-gray-400">Loading journey...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className={`bg-gradient-to-br from-black/70 to-black/60 backdrop-blur-xl border border-white/10 h-full flex flex-col rounded-3xl ${className}`}>
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span>Journey Heatmap</span>
          </CardTitle>
          <p className="text-sm text-gray-400">Your daily progress for {currentMonthName}</p>
        </CardHeader>

        <CardContent className="p-4 pt-0 flex-1 flex flex-col">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="text-base font-semibold text-white">{currentMonthName}</h3>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={!canNavigateNext()}
              className="text-gray-400 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Heatmap Grid - Compact calendar */}
          <div className="flex-1 flex items-center justify-center mb-4">
            <div 
              className="grid gap-1 w-full max-w-full" 
              style={{ 
                gridTemplateColumns: 'repeat(7, 1fr)', // 7 days per week
                aspectRatio: '7/5' // Maintain good proportions
              }}
            >
              {/* Weekday headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-xs text-gray-400 text-center pb-1 font-medium">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before month starts */}
              {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}
              
              {/* Month days */}
              {calendarDays.map((date) => {
                const log = dailyLogs[date]
                const score = getDailyScore(log)
                const colorClass = getScoreColor(score, !!log)
                const intensityClass = getScoreIntensity(score, !!log)
                const dayNumber = new Date(date).getDate()
                
                // Fix future date detection for calendar
                const isFutureDate = (() => {
                  const selected = new Date(date)
                  const today = new Date()
                  
                  // Compare only the date parts (year, month, day)
                  const selectedDateOnly = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate())
                  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                  
                  return selectedDateOnly.getTime() > todayDateOnly.getTime()
                })()

                return (
                  <Tooltip key={date}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleDayClick(date)}
                        className={`
                          aspect-square rounded border cursor-pointer transition-all duration-200 hover:scale-105 hover:z-10 relative flex items-center justify-center text-xs font-medium
                          ${colorClass} ${intensityClass}
                          ${isFutureDate ? 'opacity-30 cursor-not-allowed' : ''}
                        `}
                      >
                        <span className="text-white drop-shadow-sm">{dayNumber}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border border-white/20 text-white text-xs whitespace-pre-line">
                      {formatDateTooltip(date, log)}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
            <span>Less</span>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-600 rounded border opacity-20" title="No data" />
              <div className="w-3 h-3 bg-slate-600 rounded border opacity-50" title="Score: 0" />
              <div className="w-3 h-3 bg-yellow-400 rounded border opacity-60" title="Score: 1-2" />
              <div className="w-3 h-3 bg-lime-400 rounded border opacity-80" title="Score: 3-4" />
              <div className="w-3 h-3 bg-green-500 rounded border opacity-100" title="Score: 5+" />
            </div>
            <span>More</span>
          </div>

          {/* Quick Stats - Current Month */}
          <div className="pt-4 border-t border-white/10 flex-shrink-0">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-green-400">
                  {calendarDays.filter(date => {
                    const log = dailyLogs[date]
                    const score = getDailyScore(log)
                    return log && score >= 3 && score !== -999
                  }).length}
                </div>
                <div className="text-xs text-gray-400">Great Days</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">
                  {calendarDays.reduce((sum, date) => sum + (dailyLogs[date]?.focusSessions || 0), 0)}
                </div>
                <div className="text-xs text-gray-400">Focus Sessions</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-400">
                  {calendarDays.reduce((sum, date) => sum + (dailyLogs[date]?.habitsCompleted || 0), 0)}
                </div>
                <div className="text-xs text-gray-400">Total Habits</div>
              </div>
            </div>
          </div>
        </CardContent>

        <DailyLogEditor />
      </Card>
    </TooltipProvider>
  )
}