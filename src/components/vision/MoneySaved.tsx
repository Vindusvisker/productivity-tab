'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Coins, Calendar, Sparkles, Target, PiggyBank } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import { SNUS_COST_NOK, HOURLY_RATE_NOK, SNUS_TIME_MINUTES } from '@/data/vision'

interface SavingsData {
  snusSaved: number
  monthlyContributions: number
  totalSaved: number
  snusAvoided: number
  nextContributionDays: number
}

export default function MoneySaved() {
  const [savingsData, setSavingsData] = useState<SavingsData>({
    snusSaved: 0,
    monthlyContributions: 0,
    totalSaved: 0,
    snusAvoided: 0,
    nextContributionDays: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateSavings()
    
    // Listen for updates from other components
    const handleUpdate = () => calculateSavings()
    window.addEventListener('dailyLogsUpdated', handleUpdate)
    
    return () => window.removeEventListener('dailyLogsUpdated', handleUpdate)
  }, [])

  const calculateSavings = async () => {
    try {
      // Get snus savings
      const snusSaved = await calculateSnusSavings()
      
      // Get monthly contributions
      const monthlyContributions = await calculateMonthlyContributions()
      
      // Calculate days until next contribution (15th of each month)
      const nextContributionDays = calculateDaysToNext15th()
      
      // Get snus avoided count
      const snusAvoided = await calculateSnusAvoided()
      
      setSavingsData({
        snusSaved,
        monthlyContributions,
        totalSaved: snusSaved + monthlyContributions,
        snusAvoided,
        nextContributionDays
      })
    } catch (error) {
      console.error('Error calculating savings:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSnusSavings = async (): Promise<number> => {
    try {
      const dailyLogs = await storage.load('daily-logs') || {}
      const logs = Object.values(dailyLogs) as any[]
      
      if (logs.length === 0) return 0

      // Calculate baseline (same logic as before)
      const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const firstWeekLogs = sortedLogs.slice(0, 7)
      const totalSnus = firstWeekLogs.reduce((sum, log) => sum + (log.snusCount || 0), 0)
      const baselineSnusPerDay = Math.max(5, Math.round(totalSnus / Math.max(1, firstWeekLogs.length)))

      // Calculate total snus savings
      return logs.reduce((sum, log) => {
        const saved = Math.max(0, baselineSnusPerDay - (log.snusCount || 0))
        return sum + (saved * SNUS_COST_NOK)
      }, 0)
    } catch (error) {
      console.error('Error calculating snus savings:', error)
      return 0
    }
  }

  const calculateMonthlyContributions = async (): Promise<number> => {
    try {
      // Get existing contributions or initialize
      const contributions = await storage.load('monthly-contributions') || {}
      
      // Calculate how many contributions should have been made
      const startDate = new Date('2024-01-15') // Adjust to your actual start date
      const today = new Date()
      
      let totalContributions = 0
      let currentDate = new Date(startDate)
      
      while (currentDate <= today) {
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
        
        // Check if contribution was made this month
        if (contributions[monthKey]) {
          totalContributions += contributions[monthKey]
        } else if (currentDate.getDate() === 15 && currentDate <= today) {
          // Auto-add contribution if we're past the 15th and it hasn't been recorded
          contributions[monthKey] = 2500
          totalContributions += 2500
        }
        
        // Move to next month's 15th
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15)
      }
      
      // Save updated contributions
      await storage.save('monthly-contributions', contributions)
      
      return totalContributions
    } catch (error) {
      console.error('Error calculating monthly contributions:', error)
      return 0
    }
  }

  const calculateSnusAvoided = async (): Promise<number> => {
    try {
      const dailyLogs = await storage.load('daily-logs') || {}
      const logs = Object.values(dailyLogs) as any[]
      
      if (logs.length === 0) return 0

      const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const firstWeekLogs = sortedLogs.slice(0, 7)
      const totalSnus = firstWeekLogs.reduce((sum, log) => sum + (log.snusCount || 0), 0)
      const baselineSnusPerDay = Math.max(5, Math.round(totalSnus / Math.max(1, firstWeekLogs.length)))

      return logs.reduce((sum, log) => {
        return sum + Math.max(0, baselineSnusPerDay - (log.snusCount || 0))
      }, 0)
    } catch (error) {
      return 0
    }
  }

  const calculateDaysToNext15th = (): number => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    let next15th = new Date(currentYear, currentMonth, 15)
    
    // If we're past the 15th this month, move to next month
    if (today.getDate() > 15) {
      next15th = new Date(currentYear, currentMonth + 1, 15)
    }
    
    const diffTime = next15th.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const formatCurrency = (amount: number) => {
    return `${Math.round(amount).toLocaleString()} NOK`
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-green-500/30 backdrop-blur-xl h-full">
        <CardContent className="p-4">
          <div className="animate-pulse text-center text-white/60 text-sm">
            Loading savings...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-green-500/30 backdrop-blur-xl h-full">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <PiggyBank className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Savings Fund</h2>
              <p className="text-xs text-green-300">Building your future</p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-400 px-2 py-1 text-xs border border-green-500/30">
            {savingsData.snusAvoided} snus avoided
          </Badge>
        </div>

        {/* Total Savings - Big Number */}
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/20 rounded-xl p-4 mb-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-sm font-medium text-green-400">Total Saved</span>
          </div>
          <div className="text-3xl font-bold text-white">{formatCurrency(savingsData.totalSaved)}</div>
          <div className="text-xs text-green-300">Available for goals</div>
        </div>

        {/* Sources Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
          {/* Snus Savings */}
          <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-4 w-4 text-emerald-400 mr-1" />
              <span className="text-xs font-medium text-emerald-400">Snus Savings</span>
            </div>
            <div className="text-lg font-bold text-white">{formatCurrency(savingsData.snusSaved)}</div>
            <div className="text-xs text-emerald-300">Health wins</div>
          </div>

          {/* Monthly Contributions */}
          <div className="bg-gradient-to-br from-teal-600/20 to-cyan-600/20 border border-teal-500/20 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-4 w-4 text-teal-400 mr-1" />
              <span className="text-xs font-medium text-teal-400">Monthly Fund</span>
            </div>
            <div className="text-lg font-bold text-white">{formatCurrency(savingsData.monthlyContributions)}</div>
            <div className="text-xs text-teal-300">2,500 NOK/month</div>
          </div>
        </div>

        {/* Next Contribution Countdown */}
        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="h-4 w-4 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-400">Next Contribution</span>
          </div>
          <div className="text-lg font-bold text-white">
            {savingsData.nextContributionDays === 0 ? 'Today!' : `${savingsData.nextContributionDays} days`}
          </div>
          <div className="text-xs text-purple-300">2,500 NOK on the 15th</div>
        </div>

        {/* Motivational Message */}
        {savingsData.totalSaved > 0 && (
          <div className="mt-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
            <div className="text-sm font-bold text-yellow-400">
              🎉 Every NOK is a step toward freedom!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 