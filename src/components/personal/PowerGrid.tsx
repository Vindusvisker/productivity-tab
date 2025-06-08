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
          icon: <Flame className="h-6 w-6" />,
          color: 'from-orange-500 to-red-500',
          suffix: 'days',
          subtitle: `${longestStreak} best`
        },
        {
          id: 'focus-hours',
          title: 'Focus Hours',
          value: totalFocusHours,
          icon: <Clock className="h-6 w-6" />,
          color: 'from-blue-500 to-cyan-500',
          suffix: 'hrs',
          subtitle: `${totalFocusSessions} sessions`
        },
        {
          id: 'total-habits',
          title: 'Total Habits',
          value: totalHabits,
          icon: <Target className="h-6 w-6" />,
          color: 'from-green-500 to-emerald-500',
          suffix: '',
          subtitle: 'completed'
        },
        {
          id: 'clean-days',
          title: 'Clean Days',
          value: cleanDays,
          icon: <Star className="h-6 w-6" />,
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
      if (getScore(log) >= 3) {
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
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-white/5 rounded-xl"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.id} 
          className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden hover:border-white/20 transition-all group hover:scale-105"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <CardContent className="p-6">
            {/* Icon with gradient background */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              
              {/* Optional badge for high values */}
              {stat.value > 10 && stat.id === 'current-streak' && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                  🔥 HOT
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-gray-400 mb-1">{stat.title}</h3>
            
            {/* Main Value */}
            <div className="text-2xl font-bold text-white mb-1">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            
            {/* Subtitle */}
            {stat.subtitle && (
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            )}

            {/* Progress indicator for streaks */}
            {stat.id === 'current-streak' && stat.value > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-800/60 rounded-full h-1">
                  <div 
                    className={`bg-gradient-to-r ${stat.color} h-full rounded-full transition-all duration-1000`}
                    style={{ width: `${Math.min((stat.value / 30) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {stat.value < 30 ? `${30 - stat.value} to 30-day milestone` : '30+ day champion!'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 