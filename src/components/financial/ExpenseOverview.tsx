'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart } from 'lucide-react'

interface ExpenseCategory {
  name: string
  amount: number
  percentage: number
  color: string
  icon: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
}

const mockExpenseData: ExpenseCategory[] = [
  {
    name: 'Subscriptions',
    amount: 1543,
    percentage: 35,
    color: 'bg-blue-500',
    icon: '📱',
    trend: 'up',
    changePercent: 12
  },
  {
    name: 'Food & Dining',
    amount: 2100,
    percentage: 28,
    color: 'bg-green-500',
    icon: '🍽️',
    trend: 'down',
    changePercent: -8
  },
  {
    name: 'Transportation',
    amount: 890,
    percentage: 20,
    color: 'bg-yellow-500',
    icon: '🚗',
    trend: 'stable',
    changePercent: 2
  },
  {
    name: 'Shopping',
    amount: 750,
    percentage: 17,
    color: 'bg-purple-500',
    icon: '🛍️',
    trend: 'up',
    changePercent: 15
  }
]

export default function ExpenseOverview() {
  const [expenses, setExpenses] = useState<ExpenseCategory[]>(mockExpenseData)
  const [totalSpent, setTotalSpent] = useState(0)
  const [monthlyBudget] = useState(6000)

  useEffect(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    setTotalSpent(total)
  }, [expenses])

  const formatCurrency = (amount: number) => {
    return `kr${amount.toLocaleString()}`
  }

  const budgetUsedPercent = (totalSpent / monthlyBudget) * 100
  const remainingBudget = monthlyBudget - totalSpent

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-400" />
      case 'down': return <TrendingDown className="h-3 w-3 text-green-400" />
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-400'
      case 'down': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <Card className="bg-black/60 border border-white/10 backdrop-blur-xl h-full overflow-hidden rounded-xl">
      <CardContent className="p-3 h-full flex flex-col">
        
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PieChart className="h-4 w-4 text-white" />
            <div>
              <h3 className="text-sm font-bold text-white">This Month</h3>
              <p className="text-xs text-gray-400">Expense breakdown</p>
            </div>
          </div>
          <Badge className="bg-white/10 text-white px-2 py-1 text-xs rounded">
            January
          </Badge>
        </div>

        {/* Budget Overview - Compact */}
        <div className="mb-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3 text-white" />
                <span className="text-xs text-gray-400">Monthly Budget</span>
              </div>
              <span className="text-xs text-gray-400">{budgetUsedPercent.toFixed(1)}% used</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <div className="text-xs text-gray-400">Spent</div>
                <div className="text-lg font-bold text-white">{formatCurrency(totalSpent)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Remaining</div>
                <div className="text-lg font-bold text-white">{formatCurrency(remainingBudget)}</div>
              </div>
            </div>

            {/* Budget Progress Bar - Smaller */}
            <div className="w-full bg-gray-800/60 rounded-full h-2 mb-1">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  budgetUsedPercent > 90
                    ? 'bg-red-400'
                    : budgetUsedPercent > 75
                    ? 'bg-orange-400'
                    : 'bg-green-400'
                }`}
                style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
              />
            </div>
            
            <div className="text-xs text-gray-400 text-center">
              {remainingBudget < 0 ? 'Over budget!' : `${(100 - budgetUsedPercent).toFixed(1)}% left`}
            </div>
          </div>
        </div>

        {/* Expense Categories - Compact */}
        <div className="flex-1 overflow-y-auto">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-white" />
            Categories
          </h4>
          
          <div className="space-y-2">
            {expenses.slice(0, 4).map((expense, index) => (
              <div
                key={expense.name}
                className="bg-white/5 border border-white/10 rounded-lg p-2 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 ${expense.color} rounded-full flex items-center justify-center text-xs`}>
                      {expense.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{expense.name}</div>
                      <div className="text-xs text-gray-400">{expense.percentage}% of budget</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{formatCurrency(expense.amount)}</div>
                    <div className={`text-xs flex items-center ${getTrendColor(expense.trend)}`}>
                      {getTrendIcon(expense.trend)}
                      <span className="ml-1">
                        {expense.changePercent > 0 ? '+' : ''}{expense.changePercent}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category Progress - Smaller */}
                <div className="w-full bg-gray-800/60 rounded-full h-1">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${expense.color}`}
                    style={{ width: `${expense.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats - Compact */}
        <div className="mt-3 pt-2 border-t border-white/10">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-400">Daily Avg</div>
              <div className="text-sm font-bold text-white">{formatCurrency(Math.round(totalSpent / 30))}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Days Left</div>
              <div className="text-sm font-bold text-white">15</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 