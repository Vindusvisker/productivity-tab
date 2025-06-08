'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'

interface SnusData {
  dailyCount: number
  totalDays: number
  successfulDays: number
  failedDays: number
  currentStreak: number
  lastDate: string
}

export default function SnusTracker() {
  const [dailyCount, setDailyCount] = useState(0)
  const [showShame, setShowShame] = useState(false)
  const [snusData, setSnusData] = useState<SnusData>({
    dailyCount: 0,
    totalDays: 0,
    successfulDays: 0,
    failedDays: 0,
    currentStreak: 0,
    lastDate: ''
  })
  
  const DAILY_LIMIT = 5

  // Load data on mount
  useEffect(() => {
    loadSnusData()
  }, [])

  // Check if we need to reset daily (new day)
  useEffect(() => {
    const checkAndReset = () => {
      const today = new Date().toDateString()
      
      if (snusData.lastDate && snusData.lastDate !== today) {
        handleDayEnd()
      }
    }

    checkAndReset()
    // Check every minute for date change
    const interval = setInterval(checkAndReset, 60000)
    return () => clearInterval(interval)
  }, [snusData.lastDate])

  const loadSnusData = async () => {
    try {
      const saved = await storage.load('snus-data')
      if (saved) {
        setSnusData(saved)
        setDailyCount(saved.dailyCount)
      }
    } catch (error) {
      console.error('Error loading snus data:', error)
    }
  }

  const saveSnusData = async (data: SnusData) => {
    try {
      await storage.save('snus-data', data)
      setSnusData(data)
    } catch (error) {
      console.error('Error saving snus data:', error)
    }
  }

  const handleDayEnd = async () => {
    const today = new Date().toDateString()
    const wasSuccessful = dailyCount <= DAILY_LIMIT
    
    const newData: SnusData = {
      ...snusData,
      dailyCount: 0,
      totalDays: snusData.totalDays + 1,
      successfulDays: wasSuccessful ? snusData.successfulDays + 1 : snusData.successfulDays,
      failedDays: wasSuccessful ? snusData.failedDays : snusData.failedDays + 1,
      currentStreak: wasSuccessful ? snusData.currentStreak + 1 : 0,
      lastDate: today
    }
    
    await saveSnusData(newData)
    setDailyCount(0)
    setShowShame(false)
  }

  const incrementSnus = async () => {
    const newCount = dailyCount + 1
    const today = new Date().toDateString()
    
    setDailyCount(newCount)
    
    if (newCount > DAILY_LIMIT) {
      setShowShame(true)
    }
    
    const updatedData: SnusData = {
      ...snusData,
      dailyCount: newCount,
      lastDate: today
    }
    
    await saveSnusData(updatedData)
    
    // Save timestamp for detailed tracking
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const existingTimestamps = await storage.load(`snus-timestamps-${today}`) || []
    const updatedTimestamps = [...existingTimestamps, currentTime]
    await storage.save(`snus-timestamps-${today}`, updatedTimestamps)
    
    // Update day data with new snus count
    const existingDayData = await storage.load(`day-data-${today}`) || {}
    const updatedDayData = {
      ...existingDayData,
      date: today,
      snusCount: newCount,
      snusStatus: newCount === 0 ? 'success' : newCount <= DAILY_LIMIT ? 'pending' : 'failed',
      habits: existingDayData.habits || [],
      focusSessions: existingDayData.focusSessions || 0,
      allHabitsCompleted: existingDayData.allHabitsCompleted || false
    }
    await storage.save(`day-data-${today}`, updatedDayData)
  }

  const resetDay = async () => {
    setDailyCount(0)
    setShowShame(false)
    
    const updatedData: SnusData = {
      ...snusData,
      dailyCount: 0
    }
    
    await saveSnusData(updatedData)
  }

  const getStatusColor = () => {
    if (dailyCount === 0) return 'text-green-400'
    if (dailyCount <= DAILY_LIMIT) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusMessage = () => {
    if (dailyCount === 0) return 'Clean day! 🌟'
    if (dailyCount <= DAILY_LIMIT) return `${DAILY_LIMIT - dailyCount} left today`
    return 'Over limit! 😱'
  }

  const getProgressPercentage = () => {
    return Math.min((dailyCount / DAILY_LIMIT) * 100, 100)
  }

  // Calculate stroke dash array for circular progress
  const radius = 35
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (getProgressPercentage() / 100) * circumference

  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
      <CardContent className="p-6">
        {/* Header with circular progress */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">Snus Tracker</h2>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusMessage()}
            </p>
          </div>
          
          {/* Circular Progress Indicator */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 80 80">
              {/* Background circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-300 ease-in-out ${
                  dailyCount > DAILY_LIMIT ? 'text-red-400' : 'text-yellow-400'
                }`}
                strokeLinecap="round"
              />
            </svg>
            {/* Progress text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-bold ${getStatusColor()}`}>
                {dailyCount}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mb-4">
          <Button
            onClick={incrementSnus}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-red-300 rounded-2xl py-3"
          >
            <Plus className="h-4 w-4 mr-2" />
            Take Snus
          </Button>
          
          <Button
            onClick={resetDay}
            variant="outline"
            className="bg-gray-800/60 hover:bg-gray-700/60 border-gray-600 text-gray-300 hover:text-white rounded-2xl py-3"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Limit Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Daily Progress</span>
            <span>{dailyCount}/{DAILY_LIMIT}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                dailyCount > DAILY_LIMIT 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500'
              }`}
              style={{ width: `${Math.min(getProgressPercentage(), 100)}%` }}
            />
          </div>
        </div>

        {/* Shame Notification */}
        {showShame && (
          <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Shame! You've exceeded your daily limit 😔
              </span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {dailyCount === 0 && (
          <div className="p-3 bg-green-900/30 border border-green-500/50 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Great job! Keep it up! 🌟
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 