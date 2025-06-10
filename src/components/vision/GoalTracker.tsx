'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, ExternalLink, Trophy, Zap, Plus, Star, Clock } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import { defaultGoals, type FinancialGoal } from '@/data/vision'

export default function GoalTracker() {
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [totalSaved, setTotalSaved] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGoalsAndSavings()
    
    // Listen for updates from other components
    const handleUpdate = () => loadGoalsAndSavings()
    window.addEventListener('dailyLogsUpdated', handleUpdate)
    
    return () => window.removeEventListener('dailyLogsUpdated', handleUpdate)
  }, [])

  const loadGoalsAndSavings = async () => {
    try {
      // Load goals from storage (or use defaults)
      const savedGoals = await storage.load('vision-goals') || defaultGoals
      
      // Calculate total savings (snus + monthly contributions)
      const totalSavings = await calculateTotalSavings()
      
      // Update goals with current savings amount (distribute across top priority goals)
      const updatedGoals = distributeSavingsToGoals(savedGoals, totalSavings)
      
      setGoals(updatedGoals)
      setTotalSaved(totalSavings)
    } catch (error) {
      console.error('Error loading goals and savings:', error)
      setGoals(defaultGoals)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalSavings = async (): Promise<number> => {
    try {
      // Calculate snus savings
      const snusSavings = await calculateSnusSavings()
      
      // Calculate monthly contributions
      const monthlyContributions = await calculateMonthlyContributions()
      
      return snusSavings + monthlyContributions
    } catch (error) {
      console.error('Error calculating total savings:', error)
      return 0
    }
  }

  const calculateSnusSavings = async (): Promise<number> => {
    const dailyLogs = await storage.load('daily-logs') || {}
    const logs = Object.values(dailyLogs) as any[]
    
    if (logs.length === 0) return 0

    const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const firstWeekLogs = sortedLogs.slice(0, 7)
    const totalSnus = firstWeekLogs.reduce((sum, log) => sum + (log.snusCount || 0), 0)
    const baselineSnusPerDay = Math.max(5, Math.round(totalSnus / Math.max(1, firstWeekLogs.length)))

    const SNUS_COST_NOK = 4.27
    return logs.reduce((sum, log) => {
      const saved = Math.max(0, baselineSnusPerDay - (log.snusCount || 0))
      return sum + (saved * SNUS_COST_NOK)
    }, 0)
  }

  const calculateMonthlyContributions = async (): Promise<number> => {
    const contributions = await storage.load('monthly-contributions') || {}
    return Object.values(contributions).reduce((sum: number, amount: any) => sum + (amount || 0), 0)
  }

  const distributeSavingsToGoals = (goals: FinancialGoal[], totalSavings: number): FinancialGoal[] => {
    // Sort by priority (high first) then by target amount (smaller first)
    const sortedGoals = [...goals].sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return a.targetAmount - b.targetAmount
    })

    let remainingSavings = totalSavings
    
    return sortedGoals.map(goal => {
      if (remainingSavings <= 0) {
        return { ...goal, savedAmount: 0 }
      }
      
      const allocatedAmount = Math.min(goal.targetAmount, remainingSavings)
      remainingSavings -= allocatedAmount
      
      return { ...goal, savedAmount: allocatedAmount }
    })
  }

  const getProgressPercentage = (goal: FinancialGoal) => {
    return Math.min(100, (goal.savedAmount / goal.targetAmount) * 100)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'experience': return '🏔️'
      case 'education': return '📚'
      case 'health': return '💪'
      case 'investment': return '💰'
      default: return '🎯'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'experience': return 'from-pink-500/20 to-rose-500/20 border-pink-500/30'
      case 'education': return 'from-blue-500/20 to-indigo-500/20 border-blue-500/30'
      case 'health': return 'from-green-500/20 to-emerald-500/20 border-green-500/30'
      case 'investment': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
      default: return 'from-purple-500/20 to-indigo-500/20 border-purple-500/30'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <Star className="h-2 w-2" /> }
      case 'medium': return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <Zap className="h-2 w-2" /> }
      case 'low': return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Clock className="h-2 w-2" /> }
      default: return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: <Target className="h-2 w-2" /> }
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-2 border-purple-500/30 backdrop-blur-xl h-full">
        <CardContent className="p-4">
          <div className="animate-pulse text-center text-white/60 text-sm">
            Loading goals...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-2 border-purple-500/30 backdrop-blur-xl h-full overflow-hidden">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-400" />
            <span className="text-lg font-bold text-white">Goals</span>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 px-2 py-1 text-xs border border-purple-500/30">
            {Math.round(totalSaved).toLocaleString()} NOK
          </Badge>
        </div>

        {/* Goals List - Compact */}
        <div className="space-y-3 flex-1 overflow-y-auto">
          {goals.slice(0, 4).map((goal) => {
            const progress = getProgressPercentage(goal)
            const isCompleted = progress >= 100
            const priorityBadge = getPriorityBadge(goal.priority)
            
            return (
              <div
                key={goal.id}
                className={`bg-gradient-to-br ${getCategoryColor(goal.category)} rounded-lg p-3 relative overflow-hidden ${
                  isCompleted ? 'shadow-lg shadow-green-500/20' : ''
                }`}
              >
                {/* Completed Goal Celebration */}
                {isCompleted && (
                  <div className="absolute top-1 right-1">
                    <Trophy className="h-3 w-3 text-yellow-400 animate-pulse" />
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-lg">{getCategoryIcon(goal.category)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">
                        {goal.name}
                        {isCompleted && <span className="text-green-400 ml-1">🎉</span>}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-gray-300 truncate">{goal.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <Badge className={`${priorityBadge.color} px-1 py-0.5 text-xs flex items-center space-x-1 flex-shrink-0 ml-2`}>
                    {priorityBadge.icon}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>{Math.round(goal.savedAmount).toLocaleString()}</span>
                    <span>{goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-800/60 rounded-full h-2 relative overflow-hidden border border-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 animate-pulse'
                          : 'bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    >
                      {progress > 10 && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse opacity-60" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{progress.toFixed(1)}%</span>
                    <span>
                      {goal.targetAmount - goal.savedAmount > 0
                        ? `${Math.round(goal.targetAmount - goal.savedAmount).toLocaleString()} left`
                        : 'Complete!'
                      }
                    </span>
                  </div>
                </div>

                {/* External Link */}
                {goal.externalUrl && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs px-2 py-1 h-6"
                      onClick={() => window.open(goal.externalUrl, '_blank')}
                    >
                      <ExternalLink className="h-2 w-2 mr-1" />
                      View
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Add New Goal Button - Compact */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <Button
            variant="outline"
            className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs h-8"
            onClick={() => {
              // TODO: Implement add goal functionality
              console.log('Add new goal functionality to be implemented')
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Goal
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 