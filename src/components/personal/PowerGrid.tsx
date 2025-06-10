'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Flame, Clock, Target, Trophy, Zap, Calendar, Star } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'

type DailyLog = {
  date: string
  habitsCompleted: number
  focusSessions: number
  snusCount: number
}

interface PowerStat {
  id: string
  title: string
  value: number
  icon: React.ReactNode
  color: string
  suffix?: string
  subtitle?: string
}

export default function PowerGrid() {
  const [stats, setStats] = useState<PowerStat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPowerStats()
    
    // Listen for daily logs updates from JourneyHeatmap
    const handleDailyLogsUpdate = () => {
      loadPowerStats()
    }
    
    window.addEventListener('dailyLogsUpdated', handleDailyLogsUpdate)
    
    return () => {
      window.removeEventListener('dailyLogsUpdated', handleDailyLogsUpdate)
    }
  }, [])

  const loadPowerStats = async () => {
    try {
      // Load daily logs from JourneyHeatmap (main data source)
      const dailyLogs = await storage.load('daily-logs') || {}
      const logs = Object.values(dailyLogs as Record<string, DailyLog>)
      
      // Calculate current habit streak
      const currentStreak = calculateCurrentStreak(logs)
      
      // Calculate total stats from all daily logs
      const totalHabits = logs.reduce((sum, log) => sum + log.habitsCompleted, 0)
      const totalFocusSessions = logs.reduce((sum, log) => sum + log.focusSessions, 0)
      const totalFocusHours = Math.round((totalFocusSessions * 25) / 60) // 25min sessions to hours
      
      // Calculate clean days (days with 0 snus)
      const cleanDays = logs.filter(log => log.snusCount === 0).length
      const totalLoggedDays = logs.length
      const cleanDayRate = totalLoggedDays > 0 ? Math.round((cleanDays / totalLoggedDays) * 100) : 0
      
      // Calculate longest streak (from historical data)
      const longestStreak = calculateLongestStreak(logs)

      const powerStats: PowerStat[] = [
        {
          id: 'current-streak',
          title: 'Current Streak',
          value: currentStreak,
          icon: <Flame className="h-4 w-4" />,
          color: 'from-orange-500 to-red-500',
          suffix: 'days',
          subtitle: `${longestStreak} best`
        },
        {
          id: 'focus-hours',
          title: 'Focus Hours',
          value: totalFocusHours,
          icon: <Clock className="h-4 w-4" />,
          color: 'from-blue-500 to-cyan-500',
          suffix: 'hrs',
          subtitle: `${totalFocusSessions} sessions`
        },
        {
          id: 'total-habits',
          title: 'Total Habits',
          value: totalHabits,
          icon: <Target className="h-4 w-4" />,
          color: 'from-green-500 to-emerald-500',
          suffix: '',
          subtitle: 'completed'
        },
        {
          id: 'clean-days',
          title: 'Clean Days',
          value: cleanDays,
          icon: <Star className="h-4 w-4" />,
          color: 'from-purple-500 to-pink-500',
          suffix: '',
          subtitle: `${cleanDayRate}% rate`
        }
      ]

      setStats(powerStats)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading power stats:', error)
      setIsLoading(false)
    }
  }

  const calculateCurrentStreak = (logs: DailyLog[]): number => {
    if (logs.length === 0) return 0
    
    // Sort logs by date (newest first)
    const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    
    // Check if today has good activity (score >= 3)
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

  const calculateLongestStreak = (logs: DailyLog[]): number => {
    if (logs.length === 0) return 0
    
    const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const getScore = (log: DailyLog) => log.habitsCompleted * 2 + log.focusSessions * 1 - log.snusCount * 1
    
    let maxStreak = 0
    let currentStreak = 0
    
    for (const log of sortedLogs) {
      if (getScore(log) >= 3) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }
    
    return maxStreak
  }

  const AnimatedCounter = ({ value, suffix }: { value: number; suffix?: string }) => {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
      const duration = 2000 // 2 seconds
      const steps = 60
      const increment = value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }, [value])

    return (
      <span>
        {displayValue.toLocaleString()}
        {suffix && <span className="text-sm ml-1 opacity-80">{suffix}</span>}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex space-x-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/5 rounded-xl px-4 py-3 flex-1 animate-pulse">
            <div className="h-4 bg-white/10 rounded mb-2"></div>
            <div className="h-6 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div 
          key={stat.id} 
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-3 hover:bg-white/10 transition-all group"
        >
          <div className="flex items-center space-x-2">
            {/* Icon */}
            <div className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
              {stat.icon}
            </div>
            
            {/* Stats */}
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-400 font-medium">{stat.title}</div>
              <div className="text-lg font-bold text-white">
                {stat.value.toLocaleString()}
                {stat.suffix && <span className="text-xs ml-1 opacity-70">{stat.suffix}</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 