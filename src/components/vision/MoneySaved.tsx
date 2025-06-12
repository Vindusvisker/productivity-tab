'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Coins, Calendar, Sparkles, Target, PiggyBank } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import { UserConfig } from '../../types/UserConfig'

interface MoneySavedProps {
  userConfig?: UserConfig | null
}

interface SavingsData {
  habitSaved: number
  monthlyContributions: number
  totalSaved: number
  habitsAvoided: number
  nextContributionDays: number
}

export default function MoneySaved({ userConfig }: MoneySavedProps) {
  const [savingsData, setSavingsData] = useState<SavingsData>({
    habitSaved: 0,
    monthlyContributions: 0,
    totalSaved: 0,
    habitsAvoided: 0,
    nextContributionDays: 0
  })
  const [loading, setLoading] = useState(true)

  // Get habit name from user config
  const getHabitName = () => {
    if (!userConfig?.hasAddiction) return 'habit'
    if (userConfig.addictionName && userConfig.addictionName.trim()) {
      return userConfig.addictionName.toLowerCase()
    }
    
    switch (userConfig.addictionType) {
      case 'snus': return 'snus'
      case 'tobacco': return 'cigarette'
      case 'alcohol': return 'drink'
      case 'gambling': return 'bet'
      case 'other': return 'habit'
      default: return 'habit'
    }
  }

  // Get currency symbol from user config
  const getCurrencySymbol = () => {
    if (!userConfig) return 'NOK'
    return userConfig.currency
  }

  // Format currency using user's configured currency
  const formatCurrency = (amount: number) => {
    if (!userConfig) return `${Math.round(amount).toLocaleString()} NOK`
    
    const symbol = userConfig.currency
    switch (symbol) {
      case 'USD': return `$${Math.round(amount).toLocaleString()}`
      case 'EUR': return `€${Math.round(amount).toLocaleString()}`
      case 'SEK': 
      case 'NOK': 
      default: return `${Math.round(amount).toLocaleString()} ${symbol}`
    }
  }

  useEffect(() => {
    calculateSavings()
    
    // Listen for updates from other components
    const handleUpdate = () => calculateSavings()
    window.addEventListener('dailyLogsUpdated', handleUpdate)
    
    return () => window.removeEventListener('dailyLogsUpdated', handleUpdate)
  }, [userConfig])

  const calculateSavings = async () => {
    try {
      // Get habit savings (only if user has addiction tracking)
      const habitSaved = userConfig?.hasAddiction ? await calculateHabitSavings() : 0
      
      // Get monthly contributions
      const monthlyContributions = await calculateMonthlyContributions()
      
      // Calculate days until next contribution
      const nextContributionDays = calculateDaysToNextContribution()
      
      // Get habits avoided count (only if user has addiction tracking)
      const habitsAvoided = userConfig?.hasAddiction ? await calculateHabitsAvoided() : 0
      
      setSavingsData({
        habitSaved,
        monthlyContributions,
        totalSaved: habitSaved + monthlyContributions,
        habitsAvoided,
        nextContributionDays
      })
    } catch (error) {
      console.error('Error calculating savings:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateHabitSavings = async (): Promise<number> => {
    if (!userConfig?.hasAddiction) return 0
    
    try {
      const dailyLogs = await storage.load('daily-logs') || {}
      const logs = Object.values(dailyLogs) as any[]
      
      if (logs.length === 0) return 0

      // Calculate baseline using user's configured cost
      const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const firstWeekLogs = sortedLogs.slice(0, 7)
      const totalHabits = firstWeekLogs.reduce((sum, log) => sum + (log.snusCount || 0), 0)
      const baselineHabitsPerDay = Math.max(5, Math.round(totalHabits / Math.max(1, firstWeekLogs.length)))

      // Calculate total habit savings using user's cost per unit
      return logs.reduce((sum, log) => {
        const saved = Math.max(0, baselineHabitsPerDay - (log.snusCount || 0))
        return sum + (saved * userConfig.costPerUnit)
      }, 0)
    } catch (error) {
      console.error('Error calculating habit savings:', error)
      return 0
    }
  }

  const calculateMonthlyContributions = async (): Promise<number> => {
    try {
      // Get existing contributions or initialize
      const contributions = await storage.load('monthly-contributions') || {}
      
      const today = new Date()
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth()
      const currentDay = today.getDate()
      
      let totalContributions = 0
      
      // Only count manually recorded contributions
      Object.values(contributions).forEach((amount: any) => {
        if (typeof amount === 'number') {
          totalContributions += amount
        }
      })
      
      // Auto-add contribution ONLY for current month if today is the contribution day or later
      const contributionDay = userConfig?.contributionDay || 15
      const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
      
      if (currentDay >= contributionDay && !contributions[currentMonthKey]) {
        // Add this month's contribution using user's configured amount
        const monthlyAmount = userConfig?.monthlyContribution || 2500
        contributions[currentMonthKey] = monthlyAmount
        totalContributions += monthlyAmount
        
        // Save the updated contributions
        await storage.save('monthly-contributions', contributions)
      }
      
      return totalContributions
    } catch (error) {
      console.error('Error calculating monthly contributions:', error)
      return 0
    }
  }

  const calculateHabitsAvoided = async (): Promise<number> => {
    if (!userConfig?.hasAddiction) return 0
    
    try {
      const dailyLogs = await storage.load('daily-logs') || {}
      const logs = Object.values(dailyLogs) as any[]
      
      if (logs.length === 0) return 0

      const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const firstWeekLogs = sortedLogs.slice(0, 7)
      const totalHabits = firstWeekLogs.reduce((sum, log) => sum + (log.snusCount || 0), 0)
      const baselineHabitsPerDay = Math.max(5, Math.round(totalHabits / Math.max(1, firstWeekLogs.length)))

      return logs.reduce((sum, log) => {
        return sum + Math.max(0, baselineHabitsPerDay - (log.snusCount || 0))
      }, 0)
    } catch (error) {
      return 0
    }
  }

  const calculateDaysToNextContribution = (): number => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const contributionDay = userConfig?.contributionDay || 15
    
    let nextContribution = new Date(currentYear, currentMonth, contributionDay)
    
    // If we're past the contribution day this month, move to next month
    if (today.getDate() > contributionDay) {
      nextContribution = new Date(currentYear, currentMonth + 1, contributionDay)
    }
    
    const diffTime = nextContribution.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-green-500/30 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="animate-pulse text-center text-white/60 text-sm">
            Loading savings...
          </div>
        </CardContent>
      </Card>
    )
  }

  const habitName = getHabitName()
  const contributionAmount = userConfig?.monthlyContribution || 2500
  const contributionDay = userConfig?.contributionDay || 15

  return (
    <Card className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl">
      <CardContent className="p-4 flex flex-col">
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
          {userConfig?.hasAddiction && (
            <Badge className="bg-green-500/20 text-green-400 px-2 py-1 text-xs border border-green-500/30">
              {savingsData.habitsAvoided} {habitName} avoided
            </Badge>
          )}
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
          {/* Habit Savings */}
          {userConfig?.hasAddiction && (
            <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-4 w-4 text-emerald-400 mr-1" />
                <span className="text-xs font-medium text-emerald-400">{habitName} Savings</span>
              </div>
              <div className="text-lg font-bold text-white">{formatCurrency(savingsData.habitSaved)}</div>
              <div className="text-xs text-emerald-300">Health wins</div>
            </div>
          )}

          {/* Monthly Contributions */}
          <div className={`bg-gradient-to-br from-teal-600/20 to-cyan-600/20 border border-teal-500/20 rounded-xl p-3 text-center ${!userConfig?.hasAddiction ? 'col-span-2' : ''}`}>
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-4 w-4 text-teal-400 mr-1" />
              <span className="text-xs font-medium text-teal-400">Monthly Fund</span>
            </div>
            <div className="text-lg font-bold text-white">{formatCurrency(savingsData.monthlyContributions)}</div>
            <div className="text-xs text-teal-300">{formatCurrency(contributionAmount)}/month</div>
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
          <div className="text-xs text-purple-300">{formatCurrency(contributionAmount)} on the {contributionDay}th</div>
        </div>

        {/* Motivational Message */}
        {savingsData.totalSaved > 0 && (
          <div className="mt-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
            <div className="text-sm font-bold text-yellow-400">
              🎉 Every {getCurrencySymbol()} is a step toward freedom!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 