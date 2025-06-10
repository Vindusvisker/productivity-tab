'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, Plus, Edit3, Check, X, Calculator, Wallet } from 'lucide-react'

interface BudgetCategory {
  id: string
  name: string
  budgeted: number
  spent: number
  icon: string
  color: string
  priority: 'high' | 'medium' | 'low'
}

const mockBudgetData: BudgetCategory[] = [
  {
    id: '1',
    name: 'Necessities',
    budgeted: 3500,
    spent: 3200,
    icon: '🏠',
    color: 'bg-green-500',
    priority: 'high'
  },
  {
    id: '2',
    name: 'Subscriptions',
    budgeted: 1600,
    spent: 1543,
    icon: '📱',
    color: 'bg-blue-500',
    priority: 'medium'
  },
  {
    id: '3',
    name: 'Entertainment',
    budgeted: 800,
    spent: 650,
    icon: '🎬',
    color: 'bg-purple-500',
    priority: 'low'
  },
  {
    id: '4',
    name: 'Savings',
    budgeted: 2000,
    spent: 2000,
    icon: '💰',
    color: 'bg-yellow-500',
    priority: 'high'
  }
]

export default function BudgetPlanner() {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(mockBudgetData)
  const [totalBudget, setTotalBudget] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    const budgeted = budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0)
    const spent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0)
    setTotalBudget(budgeted)
    setTotalSpent(spent)
  }, [budgetCategories])

  const formatCurrency = (amount: number) => {
    return `kr${amount.toLocaleString()}`
  }

  const getProgressPercentage = (category: BudgetCategory) => {
    return Math.min(100, (category.spent / category.budgeted) * 100)
  }

  const getStatusColor = (category: BudgetCategory) => {
    const percentage = getProgressPercentage(category)
    if (percentage >= 100) return 'text-red-400'
    if (percentage >= 80) return 'text-orange-400'
    return 'text-green-400'
  }

  const getProgressBarColor = (category: BudgetCategory) => {
    const percentage = getProgressPercentage(category)
    if (percentage >= 100) return 'bg-red-400'
    if (percentage >= 80) return 'bg-orange-400'
    return 'bg-green-400'
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { color: 'bg-red-500/20 text-red-400', text: 'H' }
      case 'medium': return { color: 'bg-yellow-500/20 text-yellow-400', text: 'M' }
      case 'low': return { color: 'bg-blue-500/20 text-blue-400', text: 'L' }
      default: return { color: 'bg-gray-500/20 text-gray-400', text: 'N' }
    }
  }

  const handleEditStart = (category: BudgetCategory) => {
    setEditingId(category.id)
    setEditValue(category.budgeted.toString())
  }

  const handleEditSave = (categoryId: string) => {
    const newAmount = parseFloat(editValue)
    if (isNaN(newAmount) || newAmount < 0) return

    setBudgetCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, budgeted: newAmount }
          : cat
      )
    )
    setEditingId(null)
    setEditValue('')
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditValue('')
  }

  const remainingBudget = totalBudget - totalSpent
  const budgetHealth = (remainingBudget / totalBudget) * 100

  return (
    <Card className="bg-black/60 border border-white/10 backdrop-blur-xl h-full overflow-hidden rounded-xl">
      <CardContent className="p-3 h-full flex flex-col">
        
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Wallet className="h-4 w-4 text-white" />
            <div>
              <h3 className="text-sm font-bold text-white">Budget Plan</h3>
              <p className="text-xs text-gray-400">Monthly allocation</p>
            </div>
          </div>
          <Badge className="bg-white/10 text-white px-2 py-1 text-xs rounded">
            January
          </Badge>
        </div>

        {/* Budget Summary - Compact */}
        <div className="mb-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1">
                <Calculator className="h-3 w-3 text-white" />
                <span className="text-xs text-gray-400">Budget Health</span>
              </div>
              <span className={`text-xs font-medium ${
                budgetHealth > 20 ? 'text-green-400' : budgetHealth > 0 ? 'text-orange-400' : 'text-red-400'
              }`}>
                {budgetHealth > 0 ? `${budgetHealth.toFixed(1)}% left` : 'Over budget!'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <div className="text-xs text-gray-400">Budgeted</div>
                <div className="text-lg font-bold text-white">{formatCurrency(totalBudget)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Spent</div>
                <div className="text-lg font-bold text-white">{formatCurrency(totalSpent)}</div>
              </div>
            </div>

            {/* Overall Progress - Smaller */}
            <div className="w-full bg-gray-800/60 rounded-full h-2 mb-1">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  remainingBudget < 0
                    ? 'bg-red-400'
                    : remainingBudget < totalBudget * 0.2
                    ? 'bg-orange-400'
                    : 'bg-green-400'
                }`}
                style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
              />
            </div>
            
            <div className="text-xs text-gray-400 text-center">
              {((totalSpent / totalBudget) * 100).toFixed(1)}% used
            </div>
          </div>
        </div>

        {/* Budget Categories - Compact */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-white flex items-center">
              <Target className="h-3 w-3 mr-1 text-white" />
              Categories
            </h4>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs px-2 py-1 h-6 rounded"
              onClick={() => {
                console.log('Add new category')
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="space-y-2">
            {budgetCategories.map((category) => {
              const progress = getProgressPercentage(category)
              const priorityBadge = getPriorityBadge(category.priority)
              const isEditing = editingId === category.id
              
              return (
                <div
                  key={category.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 ${category.color} rounded-full flex items-center justify-center text-xs`}>
                        {category.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white flex items-center space-x-1">
                          <span>{category.name}</span>
                          <Badge className={`${priorityBadge.color} px-1 py-0.5 text-xs rounded`}>
                            {priorityBadge.text}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {isEditing ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-12 px-1 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600 focus:border-white"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30 p-1 h-5 w-5 rounded"
                            onClick={() => handleEditSave(category.id)}
                          >
                            <Check className="h-2 w-2" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30 p-1 h-5 w-5 rounded"
                            onClick={handleEditCancel}
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className={`text-xs font-bold ${getStatusColor(category)}`}>
                            {progress.toFixed(0)}%
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 p-1 h-5 w-5 rounded"
                            onClick={() => handleEditStart(category)}
                          >
                            <Edit3 className="h-2 w-2" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar - Smaller */}
                  <div className="w-full bg-gray-800/60 rounded-full h-1 mb-1">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor(category)}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="text-xs text-gray-400 text-center">
                    {category.budgeted - category.spent > 0
                      ? `${formatCurrency(category.budgeted - category.spent)} left`
                      : category.spent > category.budgeted
                      ? `${formatCurrency(category.spent - category.budgeted)} over`
                      : 'On track'
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 