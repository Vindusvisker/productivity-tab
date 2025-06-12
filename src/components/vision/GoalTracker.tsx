'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, ExternalLink, Trophy, Zap, Plus, Star, Clock, Edit2, Trash2, Calendar } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import { type FinancialGoal } from '@/data/vision'
import AddGoalDialog from './AddGoalDialog'

interface UserConfig {
  hasAddiction: boolean
  addictionType: string
  addictionName: string
  costPerUnit: number
  unitsPerPackage: number
  packageCost: number
  hourlyRate: number
  currency: string
  monthlyContribution: number
  contributionDay: number
  firstName: string
  motivation: string
  onboardingCompleted: boolean
}

export default function GoalTracker() {
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [totalSaved, setTotalSaved] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null)
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null)
  const [userConfigLoading, setUserConfigLoading] = useState(true)

  useEffect(() => {
    const loadUserConfig = async () => {
      setUserConfigLoading(true)
      const config = await storage.load('user-config')
      setUserConfig(config)
      setUserConfigLoading(false)
    }
    loadUserConfig()
  }, [])

  useEffect(() => {
    if (!userConfigLoading) {
      loadGoalsAndSavings()
    }
    // Listen for updates from other components
    const handleUpdate = () => loadGoalsAndSavings()
    window.addEventListener('dailyLogsUpdated', handleUpdate)
    return () => window.removeEventListener('dailyLogsUpdated', handleUpdate)
  }, [userConfigLoading, userConfig])

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

  const loadGoalsAndSavings = async () => {
    try {
      const savedGoals = await storage.load('vision-goals') || []
      const totalSavings = await calculateTotalSavings()
      const updatedGoals = distributeSavingsToGoals(savedGoals, totalSavings)
      setGoals(updatedGoals)
      setTotalSaved(totalSavings)
    } catch (error) {
      console.error('Error loading goals and savings:', error)
      setGoals([])
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalSavings = async (): Promise<number> => {
    try {
      const snusSavings = await calculateSnusSavings()
      const monthlyContributions = await calculateMonthlyContributions()
      return snusSavings + monthlyContributions
    } catch (error) {
      console.error('Error calculating total savings:', error)
      return 0
    }
  }

  const calculateSnusSavings = async (): Promise<number> => {
    if (!userConfig || !userConfig.hasAddiction) return 0
    const dailyLogs = await storage.load('daily-logs') || {}
    const logs = Object.values(dailyLogs) as any[]
    if (logs.length === 0) return 0
    const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const firstWeekLogs = sortedLogs.slice(0, 7)
    const totalSnus = firstWeekLogs.reduce((sum, log) => sum + (log.snusCount || 0), 0)
    const baselineSnusPerDay = Math.max(5, Math.round(totalSnus / Math.max(1, firstWeekLogs.length)))
    const COST_PER_UNIT = userConfig.costPerUnit || 4.27
    return logs.reduce((sum, log) => {
      const saved = Math.max(0, baselineSnusPerDay - (log.snusCount || 0))
      return sum + (saved * COST_PER_UNIT)
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

  const handleGoalAdded = (newGoal: FinancialGoal) => {
    loadGoalsAndSavings() // Reload to get updated distribution
  }

  const handleGoalUpdated = (updatedGoal: FinancialGoal) => {
    loadGoalsAndSavings() // Reload to get updated distribution
    setEditingGoal(null)
  }

  const handleEditGoal = (goal: FinancialGoal) => {
    setEditingGoal(goal)
    setShowAddDialog(true)
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const goals = await storage.load('vision-goals') || []
      const updatedGoals = goals.filter((goal: FinancialGoal) => goal.id !== goalId)
      await storage.save('vision-goals', updatedGoals)
      loadGoalsAndSavings()
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
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

  if (loading || userConfigLoading) {
    return (
      <Card className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl">
        <CardContent className="p-4">
          <div className="animate-pulse text-center text-white/60 text-sm">
            Loading goals...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-black/60 border border-white/10 backdrop-blur-xl overflow-hidden rounded-2xl">
        <CardContent className="p-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Savings Goals</h2>
                <p className="text-xs text-purple-300">Vision board for the future</p>
              </div>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400 px-2 py-1 text-xs border border-purple-500/30">
              {formatCurrency(totalSaved)}
            </Badge>
          </div>

          {/* Goals List or Empty State */}
          <div className="space-y-4 flex-1 overflow-y-auto">
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-500 rounded-full mx-auto animate-ping opacity-20"></div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Your Dreams Await</h3>
                <p className="text-white/60 text-sm mb-6 max-w-xs mx-auto">Start your journey by creating your first goal. Every great achievement begins with a single step.</p>
                <Button
                  onClick={() => {
                    setEditingGoal(null)
                    setShowAddDialog(true)
                  }}
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white px-6 py-3 text-sm font-medium shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </div>
            ) : (
              goals.slice(0, 2).map((goal, index) => {
                const progress = getProgressPercentage(goal)
                const isCompleted = progress >= 100
                const priorityBadge = getPriorityBadge(goal.priority)
                
                return (
                  <div
                    key={goal.id}
                    className={`group relative bg-gradient-to-br from-black/40 via-black/30 to-black/40 rounded-3xl p-6 overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
                      isCompleted ? 'shadow-2xl shadow-green-500/20' : 'shadow-xl shadow-black/20'
                    }`}
                    style={{ 
                      animationDelay: `${index * 200}ms`,
                      minHeight: '280px'
                    }}
                  >
                    {/* Goal Image Background */}
                    {goal.imageUrl && (
                      <div className="absolute inset-0 rounded-3xl overflow-hidden">
                        <img
                          src={goal.imageUrl}
                          alt={goal.name}
                          className="w-full h-full object-cover opacity-45 group-hover:opacity-70 transition-opacity duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    )}

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                    </div>
                    
                    {/* Completion Celebration */}
                    {isCompleted && (
                      <div className="absolute top-4 right-4 flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-green-400/30">
                          <Trophy className="h-4 w-4 text-yellow-400 animate-pulse" />
                          <span className="text-green-400 text-sm font-medium">Complete!</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Goal Header */}
                    <div className="relative z-10 mb-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {/* Category Icon - only show if no image */}
                          {!goal.imageUrl && (
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                            </div>
                          )}
                          {/* Goal Image Preview */}
                          {goal.imageUrl && (
                            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20">
                              <img
                                src={goal.imageUrl}
                                alt={goal.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const parent = e.currentTarget.parentElement
                                  if (parent) {
                                    parent.style.display = 'none'
                                  }
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-bold text-white leading-tight">
                              {goal.name}
                              {isCompleted && <span className="text-green-400 ml-2">🎉</span>}
                            </h3>
                            <Badge className={`bg-white/15 text-white/90 border border-white/20 px-2 py-1 text-xs flex items-center space-x-1 w-fit mt-1 backdrop-blur-sm`}>
                              {priorityBadge.icon}
                              <span className="capitalize">{goal.priority}</span>
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => handleEditGoal(goal)}
                            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white hover:text-white transition-all duration-200 shadow-lg"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm rounded-lg text-red-400 hover:text-red-300 transition-all duration-200 shadow-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {goal.description && (
                        <p className="text-white/80 text-sm leading-relaxed mb-4 max-w-md">
                          {goal.description}
                        </p>
                      )}
                      
                      {/* Deadline */}
                      {goal.deadline && (
                        <div className="flex items-center space-x-2 text-white/60 text-sm mb-4">
                          <Calendar className="h-4 w-4" />
                          <span>Target: {new Date(goal.deadline).toLocaleDateString('no-NO', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Section */}
                    <div className="relative z-10 mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-white/90">
                          <span className="text-2xl font-bold">{formatCurrency(goal.savedAmount)}</span>
                        </div>
                        <div className="text-right text-white/60">
                          <div className="text-sm">of {formatCurrency(goal.targetAmount)}</div>
                          <div className="text-lg font-semibold text-white/90">{progress.toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      {/* Enhanced Progress Bar */}
                      <div className="relative">
                        <div className="w-full bg-black/30 backdrop-blur-sm rounded-full h-4 overflow-hidden border border-white/10 shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                              isCompleted
                                ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-400'
                                : 'bg-gradient-to-r from-white/60 via-white/80 to-white/60'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          >
                            {progress > 5 && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Glow Effect */}
                        {progress > 0 && (
                          <div
                            className="absolute top-0 left-0 h-4 rounded-full blur-sm opacity-50"
                            style={{
                              width: `${Math.min(progress, 100)}%`,
                              background: isCompleted 
                                ? 'linear-gradient(90deg, #10b981, #34d399, #10b981)' 
                                : 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.8), rgba(255,255,255,0.6))'
                            }}
                          />
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 text-sm">
                        <span className="text-white/60">
                          {goal.targetAmount - goal.savedAmount > 0
                            ? `${formatCurrency(goal.targetAmount - goal.savedAmount)} remaining`
                            : 'Goal achieved! 🎯'
                          }
                        </span>
                        {!isCompleted && progress > 0 && (
                          <span className="text-white/60">
                            {Math.round((goal.targetAmount - goal.savedAmount) / (goal.savedAmount / Math.max(1, Object.keys(goals).length)))} weeks left*
                          </span>
                        )}
                      </div>
                    </div>

                    {/* External Link */}
                    {goal.externalUrl && (
                      <div className="relative z-10">
                        <Button
                          size="sm"
                          className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white hover:text-white text-sm px-4 py-2 shadow-lg transition-all duration-200 hover:scale-105"
                          onClick={() => window.open(goal.externalUrl, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Explore This Goal
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Add New Goal Button */}
          {goals.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs h-8"
                onClick={() => {
                  setEditingGoal(null)
                  setShowAddDialog(true)
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Goal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Goal Dialog */}
      <AddGoalDialog
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false)
          setEditingGoal(null)
        }}
        onGoalAdded={handleGoalAdded}
        editingGoal={editingGoal}
        onGoalUpdated={handleGoalUpdated}
      />
    </>
  )
} 