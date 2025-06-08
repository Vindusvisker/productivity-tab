'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, Circle, Plus, X, Target } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'

interface Goal {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export default function DailyGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    loadGoals()
    checkAndResetDaily()
  }, [])

  const loadGoals = async () => {
    try {
      const savedGoals = await storage.load('daily-goals')
      if (savedGoals) {
        setGoals(savedGoals)
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    }
  }

  const checkAndResetDaily = async () => {
    const today = new Date().toDateString()
    const savedDate = await storage.load('goals-date')
    
    if (savedDate !== today) {
      // New day, clear completed goals but keep incomplete ones
      const savedGoals = await storage.load('daily-goals') || []
      const uncompleted = savedGoals.filter((goal: Goal) => !goal.completed)
      
      setGoals(uncompleted)
      await storage.save('daily-goals', uncompleted)
      await storage.save('goals-date', today)
    }
  }

  const addGoal = async () => {
    if (!newGoal.trim()) return
    
    const goal: Goal = {
      id: Date.now().toString(),
      text: newGoal.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    const updatedGoals = [...goals, goal]
    setGoals(updatedGoals)
    await storage.save('daily-goals', updatedGoals)
    
    setNewGoal('')
    setIsAdding(false)
  }

  const toggleGoal = async (goalId: string) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    )
    
    setGoals(updatedGoals)
    await storage.save('daily-goals', updatedGoals)
  }

  const removeGoal = async (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId)
    setGoals(updatedGoals)
    await storage.save('daily-goals', updatedGoals)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addGoal()
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setNewGoal('')
    }
  }

  const completedCount = goals.filter(goal => goal.completed).length
  const totalCount = goals.length

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Daily Goals</h3>
          </div>
          {totalCount > 0 && (
            <span className="text-sm text-gray-400">
              {completedCount}/{totalCount} completed
            </span>
          )}
        </div>

        {/* Goals List */}
        <div className="space-y-2 mb-4">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center space-x-3 group">
              <Button
                variant="ghost"
                size="sm"
                className="p-1"
                onClick={() => toggleGoal(goal.id)}
              >
                {goal.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" />
                )}
              </Button>
              
              <span className={`flex-1 text-sm ${
                goal.completed 
                  ? 'text-gray-400 line-through' 
                  : 'text-gray-200'
              }`}>
                {goal.text}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeGoal(goal.id)}
              >
                <X className="h-3 w-3 text-gray-400 hover:text-red-400" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add Goal Input */}
        {isAdding ? (
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="What do you want to accomplish today?"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
              autoFocus
            />
            <Button
              size="sm"
              onClick={addGoal}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false)
                setNewGoal('')
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-gray-200"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add goal for today
          </Button>
        )}

        {/* Completion Celebration */}
        {totalCount > 0 && completedCount === totalCount && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
            <p className="text-blue-400 text-sm text-center">
              🎯 All goals completed! You&apos;re unstoppable today!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 