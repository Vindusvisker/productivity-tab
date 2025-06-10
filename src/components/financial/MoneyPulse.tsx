'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, TrendingUp, Target, Eye, Banknote, ArrowUp, CheckCircle } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'

// Your actual financial data
const MONTHLY_TRANSFER_NOK = 2500
const MONTHLY_SALARY_NOK = 30000

interface MoneyPulseData {
  monthlyProgress: number
  visionGoalsProgress: number
  financialWellness: number
  savingsRate: number
  transfersThisMonth: number
  goalsMet: number
  totalGoals: number
}

export default function MoneyPulse() {
  const [pulseData, setPulseData] = useState<MoneyPulseData>({
    monthlyProgress: 0,
    visionGoalsProgress: 0,
    financialWellness: 0,
    savingsRate: 0,
    transfersThisMonth: 0,
    goalsMet: 0,
    totalGoals: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateMoneyPulse()
    
    // Listen for updates from other components
    const handleUpdate = () => calculateMoneyPulse()
    window.addEventListener('dailyLogsUpdated', handleUpdate)
    
    return () => window.removeEventListener('dailyLogsUpdated', handleUpdate)
  }, [])

  const calculateMoneyPulse = async () => {
    try {
      // Get current date info
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      const dayOfMonth = now.getDate()
      
      // Calculate monthly progress (how far through the month we are)
      const monthlyProgress = (dayOfMonth / daysInMonth) * 100

      // Mock vision goals progress (in real app, this would come from Vision tab)
      const visionGoals = [
        { name: 'Emergency Fund', target: 50000, current: 32000 },
        { name: 'Investment Portfolio', target: 100000, current: 15000 },
        { name: 'Vacation Fund', target: 25000, current: 8500 }
      ]
      
      const totalGoals = visionGoals.length
      const goalsMet = visionGoals.filter(goal => goal.current >= goal.target).length
      const visionGoalsProgress = visionGoals.reduce((sum, goal) => {
        return sum + Math.min((goal.current / goal.target) * 100, 100)
      }, 0) / visionGoals.length

      // Calculate transfers this month (simulate based on day)
      const expectedTransfers = Math.floor(dayOfMonth / (daysInMonth / 1)) // Assuming one transfer per month
      const transfersThisMonth = Math.min(expectedTransfers, 1) * MONTHLY_TRANSFER_NOK

      // Calculate savings rate
      const savingsRate = (MONTHLY_TRANSFER_NOK / MONTHLY_SALARY_NOK) * 100

      // Calculate overall financial wellness score
      const wellnessFactors = [
        Math.min(savingsRate / 10, 10), // Savings rate factor (10% = full score)
        (visionGoalsProgress / 100) * 10, // Vision goals progress
        transfersThisMonth > 0 ? 10 : 0, // Transfer consistency
        Math.min((dayOfMonth / daysInMonth) * 10, 10), // Month progress
      ]
      const financialWellness = wellnessFactors.reduce((sum, factor) => sum + factor, 0) / wellnessFactors.length * 10

      setPulseData({
        monthlyProgress,
        visionGoalsProgress,
        financialWellness,
        savingsRate,
        transfersThisMonth,
        goalsMet,
        totalGoals
      })
    } catch (error) {
      console.error('Error calculating money pulse:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `kr${Math.round(amount).toLocaleString()}`
  }

  const getWellnessColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getWellnessBorderColor = (score: number) => {
    if (score >= 80) return 'border-green-500/20'
    if (score >= 60) return 'border-yellow-500/20'
    if (score >= 40) return 'border-orange-500/20'
    return 'border-red-500/20'
  }

  const getWellnessBgColor = (score: number) => {
    if (score >= 80) return 'from-green-500/10 to-emerald-500/10'
    if (score >= 60) return 'from-yellow-500/10 to-amber-500/10'
    if (score >= 40) return 'from-orange-500/10 to-red-500/10'
    return 'from-red-500/10 to-pink-500/10'
  }

  const getWellnessMessage = (score: number) => {
    if (score >= 80) return "Exceptional financial health! 💪"
    if (score >= 60) return "Good momentum, keep it up! 📈"
    if (score >= 40) return "Room for improvement 🎯"
    return "Let's get back on track 💡"
  }

  if (loading) {
    return (
      <Card className="bg-black/60 border border-white/10 backdrop-blur-xl h-full overflow-hidden rounded-xl">
        <CardContent className="p-3">
          <div className="animate-pulse text-center text-white/60 text-sm">
            Loading financial pulse...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/60 border border-white/10 backdrop-blur-xl h-full overflow-hidden rounded-xl">
      <CardContent className="p-3 h-full flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-pink-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Financial Pulse</h3>
              <p className="text-xs text-gray-400">Wellness & Goals</p>
            </div>
          </div>
          <div className={`p-1 rounded-full ${pulseData.financialWellness > 70 ? 'animate-pulse' : ''}`}>
            <Heart className={`h-4 w-4 ${getWellnessColor(pulseData.financialWellness)}`} />
          </div>
        </div>

        {/* Financial Wellness Score */}
        <div className={`bg-gradient-to-br ${getWellnessBgColor(pulseData.financialWellness)} border ${getWellnessBorderColor(pulseData.financialWellness)} rounded-lg p-3 mb-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Wellness Score</span>
            <Badge className={`${getWellnessColor(pulseData.financialWellness)} bg-transparent border-current px-2 py-1 text-xs`}>
              {Math.round(pulseData.financialWellness)}/100
            </Badge>
          </div>
          
          <div className="text-2xl font-bold text-white mb-2">
            {Math.round(pulseData.financialWellness)}%
          </div>
          
          <div className="w-full bg-gray-800/60 rounded-full h-2 mb-2">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                pulseData.financialWellness >= 80 ? 'bg-green-400' :
                pulseData.financialWellness >= 60 ? 'bg-yellow-400' :
                pulseData.financialWellness >= 40 ? 'bg-orange-400' : 'bg-red-400'
              }`}
              style={{ width: `${pulseData.financialWellness}%` }}
            />
          </div>
          
          <div className="text-xs text-gray-300 text-center">
            {getWellnessMessage(pulseData.financialWellness)}
          </div>
        </div>

        {/* Monthly Transfer */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <Banknote className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-gray-400">Monthly Transfer</span>
            </div>
            {pulseData.transfersThisMonth > 0 && (
              <CheckCircle className="h-3 w-3 text-green-400" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-blue-400">
                {formatCurrency(MONTHLY_TRANSFER_NOK)}
              </div>
              <div className="text-xs text-gray-400">
                {pulseData.savingsRate.toFixed(1)}% of salary
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {pulseData.transfersThisMonth > 0 ? 'Transferred' : 'Pending'}
              </div>
              <div className="text-xs text-gray-400">
                {Math.round(pulseData.monthlyProgress)}% through month
              </div>
            </div>
          </div>
        </div>

        {/* Vision Goals Connection */}
        <div className="mb-4">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center">
            <Eye className="h-3 w-3 mr-1 text-purple-400" />
            Vision Goals
          </h4>
          
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Overall Progress</span>
              <span className="text-xs text-purple-400">{pulseData.goalsMet}/{pulseData.totalGoals} goals</span>
            </div>
            
            <div className="text-lg font-bold text-purple-400 mb-1">
              {Math.round(pulseData.visionGoalsProgress)}%
            </div>
            
            <div className="w-full bg-gray-800/60 rounded-full h-2 mb-2">
              <div 
                className="h-full bg-purple-400 rounded-full transition-all duration-1000"
                style={{ width: `${pulseData.visionGoalsProgress}%` }}
              />
            </div>
            
            <div className="text-xs text-gray-300">
              {pulseData.goalsMet > 0 ? `${pulseData.goalsMet} goals achieved!` : 'Working towards your vision'}
            </div>
          </div>
        </div>

        {/* Monthly Progress */}
        <div className="flex-1 flex items-end">
          <div className="w-full bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-3 w-3 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-medium">Month Progress</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-cyan-400">
                  {Math.round(pulseData.monthlyProgress)}%
                </div>
                <div className="text-xs text-gray-400">
                  Day {new Date().getDate()} of {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
                </div>
              </div>
              <div className="text-right">
                <ArrowUp className={`h-4 w-4 text-cyan-400 ${pulseData.monthlyProgress > 50 ? 'animate-bounce' : ''}`} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 