'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Square, Clock } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'

interface TimerState {
  startTime: number | null
  duration: number // in seconds
  isRunning: boolean
  isBreak: boolean
  pausedTime: number // accumulated paused time
}

export default function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  
  // Store timer state for background operation
  const [startTime, setStartTime] = useState<number | null>(null)
  const [pausedTime, setPausedTime] = useState(0) // Accumulated time spent paused
  const sessionDurationRef = useRef<number>(25 * 60) // Store the duration when session starts
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate time remaining based on actual elapsed time
  const calculateTimeLeft = (timerState: TimerState): number => {
    if (!timerState.isRunning || !timerState.startTime) {
      // When paused or not started, return the stored duration (remaining time)
      return timerState.duration
    }
    
    const now = Date.now()
    const elapsed = Math.floor((now - timerState.startTime) / 1000)
    return Math.max(0, timerState.duration - elapsed)
  }

  // Load timer state from storage
  const loadTimerState = async (): Promise<TimerState> => {
    try {
      const saved = await storage.load('timer-state')
      if (saved) {
        return saved
      }
    } catch (error) {
      console.error('Error loading timer state:', error)
    }
    
    return {
      startTime: null,
      duration: 25 * 60,
      isRunning: false,
      isBreak: false,
      pausedTime: 0
    }
  }

  // Save timer state to storage
  const saveTimerState = async (state: TimerState) => {
    try {
      await storage.save('timer-state', state)
    } catch (error) {
      console.error('Error saving timer state:', error)
    }
  }

  // Initialize timer from storage
  useEffect(() => {
    const initTimer = async () => {
      const state = await loadTimerState()
      const currentTimeLeft = calculateTimeLeft(state)
      
      setTimeLeft(currentTimeLeft)
      setIsRunning(state.isRunning)
      setIsBreak(state.isBreak)
      setStartTime(state.startTime)
      setPausedTime(state.pausedTime)
      
      // If timer was running and time is up, complete it
      if (state.isRunning && currentTimeLeft <= 0) {
        handleTimerComplete()
      }
    }
    
    initTimer()
  }, [])

  // Update timer every second, but calculate based on actual elapsed time
  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTime) / 1000)
        const currentTimeLeft = Math.max(0, sessionDurationRef.current - elapsed)
        
        setTimeLeft(currentTimeLeft)
        
        if (currentTimeLeft <= 0) {
          handleTimerComplete()
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, startTime])

  // Handle page visibility changes (when user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && isRunning && startTime) {
        // Tab became visible again - recalculate time
        const state = await loadTimerState()
        const currentTimeLeft = calculateTimeLeft(state)
        setTimeLeft(currentTimeLeft)
        
        if (currentTimeLeft <= 0) {
          handleTimerComplete()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isRunning, startTime])

  // Load sessions completed on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const saved = await storage.load('focus-sessions')
        if (saved) {
          setSessionsCompleted(saved)
        }
      } catch (error) {
        console.error('Error loading focus sessions:', error)
      }
    }
    loadSessions()
  }, [])

  const handleTimerComplete = async () => {
    setIsRunning(false)
    setStartTime(null)
    setPausedTime(0)
    
    if (!isBreak) {
      // Focus session completed - reward XP and increment counter
      const newSessions = sessionsCompleted + 1
      setSessionsCompleted(newSessions)
      await storage.save('focus-sessions', newSessions)
      
      // Save to unified daily-logs format (same as JourneyHeatmap)
      const today = new Date().toDateString()
      const todayISO = new Date().toISOString().split('T')[0]
      
      // Update unified format
      const dailyLogsData = await storage.load('daily-logs') || {}
      const existingLog = dailyLogsData[todayISO] || { 
        date: todayISO, 
        habitsCompleted: 0, 
        focusSessions: 0, 
        snusCount: 0 
      }
      dailyLogsData[todayISO] = {
        ...existingLog,
        focusSessions: newSessions
      }
      await storage.save('daily-logs', dailyLogsData)
      
      // Save legacy format for WeeklyOverview
      const existingDayData = await storage.load(`day-data-${today}`) || {}
      const updatedDayData = {
        ...existingDayData,
        date: today,
        focusSessions: newSessions,
        habits: existingDayData.habits || [],
        snusStatus: existingDayData.snusStatus || 'pending',
        snusCount: existingDayData.snusCount || 0,
        allHabitsCompleted: existingDayData.allHabitsCompleted || false
      }
      await storage.save(`day-data-${today}`, updatedDayData)
      
      // Save detailed focus session data
      const existingFocusDetails = await storage.load(`focus-details-${today}`) || []
      const sessionDetail = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: 25 // 25-minute session
      }
      const updatedFocusDetails = [...existingFocusDetails, sessionDetail]
      await storage.save(`focus-details-${today}`, updatedFocusDetails)
      
      // Trigger updates to other components
      window.dispatchEvent(new CustomEvent('dailyLogsUpdated'))
      
      // Focus session completed - stay in focus mode but stopped
      // User can choose to start break or continue with another focus session
      setIsBreak(false)
      setTimeLeft(25 * 60)
      
      // Clear timer state - wait for user to manually start next session
      await saveTimerState({
        startTime: null,
        duration: 25 * 60,
        isRunning: false,
        isBreak: false,
        pausedTime: 0
      })
      
    } else {
      // Break completed - reset to focus mode but stay stopped
      setIsBreak(false)
      setTimeLeft(25 * 60)
      
      // Clear timer state - wait for user to manually start next session
      await saveTimerState({
        startTime: null,
        duration: 25 * 60,
        isRunning: false,
        isBreak: false,
        pausedTime: 0
      })
    }
  }

  const startTimer = async () => {
    const now = Date.now()
    // Store the current timeLeft as the session duration
    sessionDurationRef.current = timeLeft
    
    setIsRunning(true)
    setStartTime(now)
    setPausedTime(0)
    
    const state = {
      startTime: now,
      duration: timeLeft,
      isRunning: true,
      isBreak,
      pausedTime: 0
    }
    
    await saveTimerState(state)
  }

  const startBreak = async () => {
    setIsBreak(true)
    setTimeLeft(5 * 60)
    
    const now = Date.now()
    sessionDurationRef.current = 5 * 60
    
    setIsRunning(true)
    setStartTime(now)
    setPausedTime(0)
    
    const state = {
      startTime: now,
      duration: 5 * 60,
      isRunning: true,
      isBreak: true,
      pausedTime: 0
    }
    
    await saveTimerState(state)
  }

  const startFocus = async () => {
    setIsBreak(false)
    setTimeLeft(25 * 60)
    
    const now = Date.now()
    sessionDurationRef.current = 25 * 60
    
    setIsRunning(true)
    setStartTime(now)
    setPausedTime(0)
    
    const state = {
      startTime: now,
      duration: 25 * 60,
      isRunning: true,
      isBreak: false,
      pausedTime: 0
    }
    
    await saveTimerState(state)
  }

  const stopTimer = async () => {
    if (startTime) {
      // Calculate current time left and save it as the new duration
      const state = {
        startTime,
        duration: isBreak ? 5 * 60 : 25 * 60,
        isRunning: true, // Still running to get accurate calculation
        isBreak,
        pausedTime
      }
      
      const currentTimeLeft = calculateTimeLeft(state)
      
      setIsRunning(false)
      setTimeLeft(currentTimeLeft)
      setStartTime(null) // Clear start time when stopped
      setPausedTime(0) // Reset paused time since we're storing the remaining time directly
      
      const stoppedState = {
        startTime: null,
        duration: currentTimeLeft, // Save the remaining time as the new duration
        isRunning: false,
        isBreak,
        pausedTime: 0
      }
      
      await saveTimerState(stoppedState)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const totalTime = isBreak ? 5 * 60 : 25 * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  // Calculate stroke dash array for circular progress
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (getProgress() / 100) * circumference

  return (
    <Card className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
      <CardContent className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">Focus Timer</h2>
            <p className="text-sm text-gray-400">
              {isBreak ? 'Break Time 🧘' : 'Deep Work Session 🎯'}
            </p>
          </div>
          
          {/* Circular Progress */}
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-300 ease-in-out ${
                  isBreak ? 'text-green-400' : 'text-blue-400'
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock className={`h-6 w-6 ${isBreak ? 'text-green-400' : 'text-blue-400'}`} />
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className={`text-5xl font-light mb-2 ${
            isBreak ? 'text-green-400' : 'text-blue-400'
          }`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-400">
            {isBreak ? 'Time for a break!' : 'Stay focused'}
            {isRunning && (
              <span className="ml-2 text-green-400">• Running in background</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex space-x-3 mb-6">
          {!isRunning ? (
            <>
              {/* Focus/Break selection when stopped */}
              <Button
                onClick={startFocus}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-2xl py-3"
              >
                <Play className="h-4 w-4 mr-2" />
                Focus (25min)
              </Button>
              <Button
                onClick={startBreak}
                className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-2xl py-3"
              >
                <Play className="h-4 w-4 mr-2" />
                Break (5min)
              </Button>
            </>
          ) : (
            <Button
              onClick={stopTimer}
              className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 rounded-2xl py-3"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}
        </div>

        {/* Sessions Count */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">{sessionsCompleted}</div>
          <div className="text-xs text-gray-400">Focus Sessions Today</div>
          {sessionsCompleted > 0 && (
            <div className="text-xs text-green-400 mt-1">+{sessionsCompleted * 25} XP earned! 🚀</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 