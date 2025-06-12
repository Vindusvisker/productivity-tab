'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, CheckCircle, Flame, Target, Trophy } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import { UserConfig } from '../../types/UserConfig'

interface DayActivity {
  date: string
  habits: string[]
  focusSessions: number
  snusStatus: 'success' | 'failed' | 'pending'
  snusCount: number
  allHabitsCompleted: boolean
}

interface HabitDetail {
  id: string
  name: string
  completed: boolean
  completedAt?: string
  iconName: string
}

interface DayDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  dayData: DayActivity | null
  userConfig?: UserConfig | null
}

export default function DayDetailsDialog({ isOpen, onClose, dayData, userConfig }: DayDetailsDialogProps) {
  const [detailedHabits, setDetailedHabits] = useState<HabitDetail[]>([])
  const [snusHistory, setSnusHistory] = useState<string[]>([])
  const [focusHistory, setFocusHistory] = useState<{ time: string, duration: number }[]>([])

  useEffect(() => {
    if (dayData && isOpen) {
      loadDayDetails()
    }
  }, [dayData, isOpen])

  const loadDayDetails = async () => {
    if (!dayData) return

    try {
      // Load detailed habit data for this day
      const habitDetails = await storage.load(`habit-details-${dayData.date}`) || []
      setDetailedHabits(habitDetails)

      // Load snus timestamps for this day
      const snusTimestamps = await storage.load(`snus-timestamps-${dayData.date}`) || []
      setSnusHistory(snusTimestamps)

      // Load focus session details for this day
      const focusDetails = await storage.load(`focus-details-${dayData.date}`) || []
      setFocusHistory(focusDetails)

    } catch (error) {
      console.error('Error loading day details:', error)
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
      return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    }
  }

  const getSnusStatusInfo = () => {
    if (!dayData) return { text: '', color: '', emoji: '' }
    
    if (dayData.snusStatus === 'success') {
      return { text: 'Clean Day', color: 'bg-green-500/20 text-green-400 border-green-500/30', emoji: '🌟' }
    } else if (dayData.snusStatus === 'failed') {
      return { text: 'Over Limit', color: 'bg-red-500/20 text-red-400 border-red-500/30', emoji: '😔' }
    } else {
      return { text: 'Within Limit', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', emoji: '⚠️' }
    }
  }

  const getTotalFocusTime = () => {
    return focusHistory.reduce((total, session) => total + session.duration, 0)
  }

  const formatFocusTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

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

  if (!dayData) return null

  const snusInfo = getSnusStatusInfo()
  const totalFocusTime = getTotalFocusTime()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black/90 backdrop-blur-xl border border-white/20 text-white rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-blue-400" />
            <span>{getDayName(dayData.date)}</span>
            {dayData.allHabitsCompleted && <span className="text-green-400">✨</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Day Overview Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <Target className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{dayData.habits.length}</div>
              <div className="text-xs text-gray-400">Habits Completed</div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <Clock className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{dayData.focusSessions}</div>
              <div className="text-xs text-gray-400">Focus Sessions</div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <Flame className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{dayData.snusCount}</div>
              <div className="text-xs text-gray-400">{getHabitName()} Count</div>
            </div>
          </div>

          {/* Snus Status */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center">
              <span className="mr-2">{getHabitIcon()}</span>
              {getHabitName()} Status
            </h3>
            <div className={`inline-flex items-center px-3 py-2 rounded-full border text-sm font-medium ${snusInfo.color}`}>
              <span className="mr-2">{snusInfo.emoji}</span>
              {snusInfo.text}
              {dayData.snusCount > 0 && <span className="ml-2">({dayData.snusCount} taken)</span>}
            </div>
            
            {snusHistory.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-gray-400 mb-2">Timeline:</div>
                <div className="flex flex-wrap gap-2">
                  {snusHistory.map((timestamp, index) => (
                    <span key={index} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                      {timestamp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Habits Detail */}
          {dayData.habits.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                Completed Habits
                {dayData.allHabitsCompleted && (
                  <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                    Perfect Day!
                  </Badge>
                )}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dayData.habits.map((habit, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-white">{habit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Focus Sessions Detail */}
          {dayData.focusSessions > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center">
                <Clock className="h-5 w-5 text-blue-400 mr-2" />
                Focus Sessions
                <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {totalFocusTime > 0 ? formatFocusTime(totalFocusTime) : `${dayData.focusSessions} sessions`}
                </Badge>
              </h3>
              
              {focusHistory.length > 0 ? (
                <div className="space-y-2">
                  {focusHistory.map((session, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
                      <span className="text-sm text-white">Session {index + 1}</span>
                      <div className="flex items-center space-x-2 text-xs text-blue-400">
                        <span>{session.time}</span>
                        <span>•</span>
                        <span>{formatFocusTime(session.duration)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  {dayData.focusSessions} focus session{dayData.focusSessions > 1 ? 's' : ''} completed
                </div>
              )}
            </div>
          )}

          {/* Day Summary */}
          <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-white">Day Assessment</span>
              </div>
              <div className="text-sm text-gray-300">
                {dayData.allHabitsCompleted && dayData.snusStatus === 'success' 
                  ? '🏆 Perfect Day!' 
                  : dayData.habits.length >= 3 
                    ? '✅ Good Day' 
                    : '📈 Room for Improvement'
                }
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 