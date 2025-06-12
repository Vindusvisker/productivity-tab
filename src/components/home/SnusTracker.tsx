'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import { UserConfig } from '../../types/UserConfig'

interface SnusTrackerProps {
  userConfig?: UserConfig | null
}

interface SnusData {
  dailyCount: number
  totalDays: number
  successfulDays: number
  failedDays: number
  currentStreak: number
  lastDate: string
}

export default function SnusTracker({ userConfig }: SnusTrackerProps) {
  const [dailyCount, setDailyCount] = useState(0)
  const [showShame, setShowShame] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [snusData, setSnusData] = useState<SnusData>({
    dailyCount: 0,
    totalDays: 0,
    successfulDays: 0,
    failedDays: 0,
    currentStreak: 0,
    lastDate: ''
  })
  
  // Use user's configured daily limit
  const DAILY_LIMIT = userConfig?.dailyLimit || 5 // Fallback to 5 for backward compatibility
  const lastClickTimeRef = useRef<number>(0)

  // Don't render if user doesn't have addiction tracking enabled
  if (!userConfig?.hasAddiction) {
    return null
  }

  // Get display name for the habit
  const getHabitName = () => {
    // If user provided a custom name, use that
    if (userConfig.addictionName && userConfig.addictionName.trim()) {
      return userConfig.addictionName
    }
    
    // Otherwise use the standard name based on addiction type
    switch (userConfig.addictionType) {
      case 'snus': return 'Snus'
      case 'tobacco': return 'Smoking'
      case 'alcohol': return 'Alcohol'
      case 'gambling': return 'Gambling'
      case 'other': return 'Habit'
      default: return 'Habit'
    }
  }

  // Get action text for the button
  const getActionText = () => {
    // If user provided a custom name, use it in action
    if (userConfig.addictionName && userConfig.addictionName.trim()) {
      return `Use ${userConfig.addictionName}`
    }
    
    // Otherwise use specific action text based on addiction type
    switch (userConfig.addictionType) {
      case 'snus': return 'Take Snus'
      case 'tobacco': return 'Smoke'
      case 'alcohol': return 'Have Drink'
      case 'gambling': return 'Place Bet'
      case 'other': return 'Use Habit'
      default: return 'Track Usage'
    }
  }

  // Get currency symbol
  const getCurrencySymbol = () => {
    switch (userConfig.currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'SEK': return 'kr'
      case 'NOK': 
      default: return 'kr'
    }
  }

  // Load data on mount
  useEffect(() => {
    loadSnusData()
    cleanupDuplicateTimestamps() // Clean up any existing corrupted data
    
    // Expose debug helper in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // @ts-ignore
      window.clearSnusTimestamps = async () => {
        const today = new Date().toDateString()
        await storage.save(`snus-timestamps-${today}`, [])
        console.log('Cleared all snus timestamps for today')
        window.dispatchEvent(new CustomEvent('dailyLogsUpdated'))
      }
    }
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

  const cleanupDuplicateTimestamps = async () => {
    try {
      const today = new Date().toDateString()
      const existingTimestamps = await storage.load(`snus-timestamps-${today}`) || []
      
      if (existingTimestamps.length > 0) {
        // Remove duplicates while preserving order
        const uniqueTimestamps = [...new Set(existingTimestamps)]
        
        // Only save if we actually removed duplicates
        if (uniqueTimestamps.length !== existingTimestamps.length) {
          console.log(`Cleaned up ${existingTimestamps.length - uniqueTimestamps.length} duplicate timestamps`)
          await storage.save(`snus-timestamps-${today}`, uniqueTimestamps)
        }
      }
    } catch (error) {
      console.error('Error cleaning up timestamps:', error)
    }
  }

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
    const todayISO = new Date().toISOString().split('T')[0]
    const wasSuccessful = dailyCount <= DAILY_LIMIT
    
    // IMPORTANT: Save the final day's data before resetting the count
    // This ensures WeeklyOverview can access yesterday's snus count
    const finalSnusStatus = dailyCount === 0 ? 'success' : dailyCount <= DAILY_LIMIT ? 'pending' : 'failed'
    
    // Save to unified daily-logs format
    const dailyLogsData = await storage.load('daily-logs') || {}
    const existingLog = dailyLogsData[todayISO] || { 
      date: todayISO, 
      habitsCompleted: 0, 
      focusSessions: 0, 
      snusCount: 0 
    }
    dailyLogsData[todayISO] = {
      ...existingLog,
      snusCount: dailyCount // Save the final count for the day
    }
    await storage.save('daily-logs', dailyLogsData)
    
    // Save legacy day data format
    const existingDayData = await storage.load(`day-data-${today}`) || {}
    const finalDayData = {
      ...existingDayData,
      date: today,
      snusCount: dailyCount, // Save the final count for the day
      snusStatus: finalSnusStatus,
      habits: existingDayData.habits || [],
      focusSessions: existingDayData.focusSessions || 0,
      allHabitsCompleted: existingDayData.allHabitsCompleted || false
    }
    await storage.save(`day-data-${today}`, finalDayData)
    
    // Now reset for the new day
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
    
    // Trigger updates to other components so they can reload the saved data
    window.dispatchEvent(new CustomEvent('dailyLogsUpdated'))
  }

  const getShameMessage = (count: number): string => {
    const habitName = getHabitName().toLowerCase()
    const messages = [
      "Clean start — stay sharp and own the day 🧠", // 0
      "Alright, first one down — stay mindful ⚠️", // 1
      "Second hit logged. Keep your head in the game 📒", // 2
      "Three deep. You're still in control — barely 🧩", // 3
      "Four entries. Yellow zone now. Eyes on the mission 👁️", // 4
      "Limit reached. Time to lock in 🔒", // 5
      "You've crossed the line today. Regain control 🧠⚔️", // 6
      "This is no longer 'just one more'. Recalibrate. ⛔", // 7
      "You're losing the mental edge. Turn it around. 🧭", // 8
      "Momentum killer. You're stronger than this 💢", // 9
      "Double digits. You're at a crossroads 🔻", // 10
      "You're not in control — the habit is. Flip the script 🔄", // 11
      `That's your future savings right there 💸`, // 12
      "13 in. What story are you writing today? 📉", // 13
      userConfig.addictionType === 'tobacco' ? "Your lungs are waving the white flag 🫁" : "Your health is paying the price 🏥", // 14
      "15 hits. Your willpower didn't sign up for this 🧱", // 15
      "You're spiraling. Is this how you want to show up? 🎭", // 16
      "Seventeen. Let's not make this your new normal 🛑", // 17
      "You're not escaping. You're looping 🌀", // 18
      "This isn't you. This is addiction running macros 🤖", // 19
      "20 logged. Let this be your last rock bottom for the year 🧨" // 20
    ];
    
    if (count >= 20) return messages[20]
    return messages[count] || messages[6] // fallback to first shame message
  }

  const incrementSnus = async () => {
    // Prevent rapid consecutive clicks (debounce)
    const now = Date.now()
    if (now - lastClickTimeRef.current < 1000) { // 1 second debounce
      console.log('Click too rapid, ignoring')
      return
    }
    lastClickTimeRef.current = now

    // Prevent multiple concurrent executions
    if (isProcessing) {
      console.log('Already processing, ignoring')
      return
    }

    setIsProcessing(true)

    try {
      const newCount = dailyCount + 1
      const today = new Date().toDateString()
      const todayISO = new Date().toISOString().split('T')[0] // ISO format for daily-logs
      
      setDailyCount(newCount)
      
      // Always show message area (remove the condition)
      setShowShame(true)
      
      const updatedData: SnusData = {
        ...snusData,
        dailyCount: newCount,
        lastDate: today
      }
      
      await saveSnusData(updatedData)
      
      // Save timestamp for detailed tracking - only save ONE timestamp per click
      const currentTime = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit' 
      })
      const existingTimestamps = await storage.load(`snus-timestamps-${today}`) || []
      
      // Make sure we don't add duplicate timestamps (very unlikely now with seconds)
      if (!existingTimestamps.includes(currentTime)) {
        const updatedTimestamps = [...existingTimestamps, currentTime]
        await storage.save(`snus-timestamps-${today}`, updatedTimestamps)
      }
      
      // Save to unified daily-logs format (same as JourneyHeatmap)
      const dailyLogsData = await storage.load('daily-logs') || {}
      const existingLog = dailyLogsData[todayISO] || { 
        date: todayISO, 
        habitsCompleted: 0, 
        focusSessions: 0, 
        snusCount: 0 
      }
      dailyLogsData[todayISO] = {
        ...existingLog,
        snusCount: newCount
      }
      await storage.save('daily-logs', dailyLogsData)
      
      // Also update legacy day data for WeeklyOverview
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
      
      // Trigger updates to other components
      window.dispatchEvent(new CustomEvent('dailyLogsUpdated'))
    } catch (error) {
      console.error('Error incrementing snus:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const decrementSnus = async () => {
    if (dailyCount <= 0) return // Don't go below 0
    
    // Prevent rapid consecutive clicks
    const now = Date.now()
    if (now - lastClickTimeRef.current < 500) { // 500ms debounce for decrement
      return
    }
    lastClickTimeRef.current = now

    if (isProcessing) return
    setIsProcessing(true)

    try {
      const newCount = dailyCount - 1
      const today = new Date().toDateString()
      const todayISO = new Date().toISOString().split('T')[0]
      
      setDailyCount(newCount)
      
      // Always show message area (remove the condition)
      setShowShame(true)
      
      const updatedData: SnusData = {
        ...snusData,
        dailyCount: newCount
      }
      
      await saveSnusData(updatedData)
      
      // Remove the last timestamp when decrementing
      const existingTimestamps = await storage.load(`snus-timestamps-${today}`) || []
      if (existingTimestamps.length > 0) {
        const updatedTimestamps = existingTimestamps.slice(0, -1) // Remove last timestamp
        await storage.save(`snus-timestamps-${today}`, updatedTimestamps)
      }
      
      // Update unified daily-logs format
      const dailyLogsData = await storage.load('daily-logs') || {}
      const existingLog = dailyLogsData[todayISO] || { 
        date: todayISO, 
        habitsCompleted: 0, 
        focusSessions: 0, 
        snusCount: 0 
      }
      dailyLogsData[todayISO] = {
        ...existingLog,
        snusCount: newCount
      }
      await storage.save('daily-logs', dailyLogsData)
      
      // Also update legacy day data
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
      
      // Trigger updates to other components
      window.dispatchEvent(new CustomEvent('dailyLogsUpdated'))
    } catch (error) {
      console.error('Error decrementing snus:', error)
    } finally {
      setIsProcessing(false)
    }
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
    <Card className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
      <CardContent className="p-6">
        {/* Header with circular progress */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">{getHabitName()} Tracker</h2>
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
            disabled={isProcessing}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-red-300 rounded-2xl py-3 disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isProcessing ? 'Adding...' : getActionText()}
          </Button>
          
          <Button
            onClick={decrementSnus}
            disabled={isProcessing || dailyCount <= 0}
            variant="outline"
            className="bg-gray-800/60 hover:bg-gray-700/60 border-gray-600 text-gray-300 hover:text-white rounded-2xl py-3 disabled:opacity-50"
          >
            <span className="text-lg font-bold">−</span>
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

        {/* Message Notification - Always visible */}
        {showShame && (
          <div className={`p-3 border rounded-2xl backdrop-blur-sm ${
            dailyCount === 0
              ? 'bg-green-900/30 border-green-500/50' // Clean day: green
              : dailyCount <= DAILY_LIMIT 
                ? 'bg-blue-900/30 border-blue-500/50' // Safe zone: blue
                : 'bg-red-900/30 border-red-500/50'   // Over limit: red
          }`}>
            <div className={`flex items-center space-x-2 ${
              dailyCount === 0
                ? 'text-green-400'  // Clean day: green text
                : dailyCount <= DAILY_LIMIT 
                  ? 'text-blue-400'  // Safe zone: blue text
                  : 'text-red-400'   // Over limit: red text
            }`}>
              {dailyCount === 0 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {getShameMessage(dailyCount)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 