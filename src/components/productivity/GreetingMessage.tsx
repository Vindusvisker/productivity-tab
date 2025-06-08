'use client'

import { useState, useEffect } from 'react'
import { storage } from '@/lib/chrome-storage'

export default function GreetingMessage() {
  const [greeting, setGreeting] = useState('')
  const [emoji, setEmoji] = useState('')
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    loadStreakAndSetGreeting()
  }, [])

  const loadStreakAndSetGreeting = async () => {
    const savedStreak = await storage.load('habit-streak') || 0
    setStreak(savedStreak)
    
    const hour = new Date().getHours()
    let timeGreeting = ''
    let timeEmoji = ''

    if (hour < 12) {
      timeGreeting = 'Good morning'
      timeEmoji = '☀️'
    } else if (hour < 17) {
      timeGreeting = 'Good afternoon'
      timeEmoji = '🌤️'
    } else {
      timeGreeting = 'Good evening'
      timeEmoji = '🌙'
    }

    // Dynamic messages based on streak
    let motivationalMessage = ''
    if (savedStreak === 0) {
      motivationalMessage = 'ready to dominate?'
    } else if (savedStreak < 7) {
      motivationalMessage = `streak building! ${savedStreak} days strong 💪`
    } else if (savedStreak < 30) {
      motivationalMessage = `on fire! ${savedStreak} day streak 🔥`
    } else {
      motivationalMessage = `absolute legend! ${savedStreak} days 👑`
    }

    setGreeting(`${timeGreeting}, ${motivationalMessage}`)
    setEmoji(timeEmoji)
  }

  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center space-x-3 mb-2">
        <span className="text-3xl">{emoji}</span>
        <h1 className="text-3xl font-bold text-white">
          {greeting}
        </h1>
      </div>
      {streak > 0 && (
        <p className="text-gray-300 text-sm">
          Keep going - you&apos;re building something amazing!
        </p>
      )}
    </div>
  )
} 