'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, CheckCircle, Flame, TrendingUp } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'

interface DayActivity {
  date: string
  habits: string[]
  focusSessions: number
  snusStatus: 'success' | 'failed' | 'pending'
}

export default function WeeklyOverview() {
  const [weekData, setWeekData] = useState<DayActivity[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)

  useEffect(() => {
    loadWeeklyData()
  }, [])

  const loadWeeklyData = async () => {
    try {
      // Get last 7 days
      const days = []
      const today = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const dateString = date.toDateString()
        
        // Load habits data for this day
        const habitsData = await storage.load(`habits-${dateString}`) || []
        const focusData = await storage.load(`focus-sessions-${dateString}`) || 0
        const snusData = await storage.load('snus-data') || { successfulDays: 0, failedDays: 0, currentStreak: 0 }
        
        // Simulate some completed habits for demo
        const completedHabits = habitsData.length > 0 ? habitsData : [
          i === 0 ? ['Workout', 'No Snus'] : [], // Today
          i === 1 ? ['Drank Water', 'Learned Something New'] : [], // Yesterday
          i === 2 ? ['Workout', 'No Snus', 'Read'] : [], // Day before
        ][Math.min(i, 2)] || []
        
        days.push({
          date: dateString,
          habits: completedHabits,
          focusSessions: i <= 2 ? Math.floor(Math.random() * 4) : 0,
          snusStatus: i === 0 ? 'pending' as const : (Math.random() > 0.3 ? 'success' as const : 'failed' as const)
        })
      }
      
      setWeekData(days)
      
      // Calculate current streak
      let streak = 0
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].snusStatus === 'success' || (days[i].snusStatus === 'pending' && days[i].habits.includes('No Snus'))) {
          streak++
        } else {
          break
        }
      }
      setCurrentStreak(streak)
      
    } catch (error) {
      console.error('Error loading weekly data:', error)
    }
  }

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
    const completedDays = weekData.filter(day => 
      day.snusStatus === 'success' || (day.snusStatus === 'pending' && day.habits.length > 0)
    ).length
    return weekData.length > 0 ? Math.round((completedDays / weekData.length) * 100) : 0
  }

  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
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
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    day.snusStatus === 'success' ? 'bg-green-400' :
                    day.snusStatus === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-white">
                      🗓️ {getDayName(day.date)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {day.habits.length > 0 ? (
                        day.habits.map((habit, idx) => (
                          <span key={idx} className="mr-2">
                            ✅ {habit}
                          </span>
                        ))
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

        {/* Week Summary */}
        <div className="mt-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-white">Week Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-orange-400">Keep the momentum!</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 