'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, Square, Clock } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'

export default function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

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
    
    if (!isBreak) {
      // Focus session completed - reward XP and increment counter
      const newSessions = sessionsCompleted + 1
      setSessionsCompleted(newSessions)
      await storage.save('focus-sessions', newSessions)
      
      // Start break timer (5 minutes)
      setIsBreak(true)
      setTimeLeft(5 * 60)
    } else {
      // Break completed - reset to focus mode
      setIsBreak(false)
      setTimeLeft(25 * 60)
    }
  }

  const startTimer = () => {
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsBreak(false)
    setTimeLeft(25 * 60)
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
    <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
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
          </div>
        </div>

        {/* Controls */}
        <div className="flex space-x-3 mb-6">
          {!isRunning ? (
            <Button
              onClick={startTimer}
              className={`flex-1 ${
                isBreak 
                  ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400'
                  : 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400'
              } rounded-2xl py-3`}
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button
              onClick={pauseTimer}
              className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 rounded-2xl py-3"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button
            onClick={resetTimer}
            variant="outline"
            className="bg-gray-800/60 hover:bg-gray-700/60 border-gray-600 text-gray-300 hover:text-white rounded-2xl py-3"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>

        {/* Sessions Count */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">{sessionsCompleted}</div>
          <div className="text-xs text-gray-400">Focus Sessions Today</div>
          {sessionsCompleted > 0 && (
            <div className="text-xs text-green-400 mt-1">+{sessionsCompleted * 50} XP earned! 🚀</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 