'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Target, DollarSign, Calendar, ExternalLink, ChevronRight, Star, Clock, Zap } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import { FinancialGoal } from '@/data/vision'
import { UserConfig } from '../../types/UserConfig'

interface AddGoalDialogProps {
  isOpen: boolean
  onClose: () => void
  onGoalAdded: (goal: FinancialGoal) => void
  editingGoal?: FinancialGoal | null
  onGoalUpdated?: (goal: FinancialGoal) => void
}

const categories = [
  { value: 'experience', label: 'Experience', icon: '🏔️' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'health', label: 'Health', icon: '💪' },
  { value: 'investment', label: 'Investment', icon: '💰' },
  { value: 'other', label: 'Other', icon: '🎯' }
] as const

const priorities = [
  { value: 'high', label: 'High Priority', icon: Star, color: 'text-red-400' },
  { value: 'medium', label: 'Medium Priority', icon: Zap, color: 'text-yellow-400' },
  { value: 'low', label: 'Low Priority', icon: Clock, color: 'text-blue-400' }
] as const

type CategoryType = 'experience' | 'education' | 'health' | 'investment' | 'other'
type PriorityType = 'high' | 'medium' | 'low'

export default function AddGoalDialog({ isOpen, onClose, onGoalAdded, editingGoal, onGoalUpdated }: AddGoalDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    category: 'experience' as CategoryType,
    priority: 'medium' as PriorityType,
    description: '',
    deadline: '',
    externalUrl: '',
    imageUrl: ''
  })

  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showPriorityPicker, setShowPriorityPicker] = useState(false)
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

  const getCurrencySymbol = () => {
    if (!userConfig) return 'NOK'
    switch (userConfig.currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'SEK':
      case 'NOK':
      default: return 'kr'
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      category: 'experience' as CategoryType,
      priority: 'medium' as PriorityType,
      description: '',
      deadline: '',
      externalUrl: '',
      imageUrl: ''
    })
    setShowCategoryPicker(false)
    setShowPriorityPicker(false)
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    } else if (editingGoal) {
      // Pre-fill form with existing goal data
      setFormData({
        name: editingGoal.name,
        targetAmount: editingGoal.targetAmount.toString(),
        category: editingGoal.category,
        priority: editingGoal.priority,
        description: editingGoal.description || '',
        deadline: editingGoal.deadline || '',
        externalUrl: editingGoal.externalUrl || '',
        imageUrl: editingGoal.imageUrl || ''
      })
    }
  }, [isOpen, editingGoal])

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.targetAmount) {
      return // Basic validation
    }

    if (editingGoal) {
      // Update existing goal
      const updatedGoal: FinancialGoal = {
        ...editingGoal,
        name: formData.name.trim(),
        targetAmount: parseFloat(formData.targetAmount) || 0,
        category: formData.category,
        priority: formData.priority,
        description: formData.description.trim(),
        deadline: formData.deadline || undefined,
        externalUrl: formData.externalUrl.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined
      }

      try {
        const goals = await storage.load('vision-goals') || []
        const updatedGoals = goals.map((goal: FinancialGoal) => 
          goal.id === editingGoal.id ? updatedGoal : goal
        )
        await storage.save('vision-goals', updatedGoals)
        
        if (onGoalUpdated) {
          onGoalUpdated(updatedGoal)
        }
        onClose()
      } catch (error) {
        console.error('Error updating goal:', error)
      }
    } else {
      // Create new goal
      const newGoal: FinancialGoal = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        targetAmount: parseFloat(formData.targetAmount) || 0,
        savedAmount: 0,
        category: formData.category,
        priority: formData.priority,
        description: formData.description.trim(),
        deadline: formData.deadline || undefined,
        externalUrl: formData.externalUrl.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined
      }

      try {
        const existingGoals = await storage.load('vision-goals') || []
        const updatedGoals = [...existingGoals, newGoal]
        await storage.save('vision-goals', updatedGoals)
        
        onGoalAdded(newGoal)
        onClose()
      } catch (error) {
        console.error('Error saving goal:', error)
      }
    }
  }

  const getCategoryData = (value: string) => {
    return categories.find(cat => cat.value === value) || categories[0]
  }

  const getPriorityData = (value: string) => {
    return priorities.find(pri => pri.value === value) || priorities[1]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-black/95 backdrop-blur-xl border border-white/20 text-white rounded-3xl p-0">
        {/* Header */}
        <DialogHeader className="p-4 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <DialogTitle className="text-lg font-bold">
              {editingGoal ? 'Edit Goal' : 'Add Goal'}
            </DialogTitle>
            <div className="w-12" /> {/* Spacer */}
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {userConfigLoading ? (
            <div className="text-center text-white/60 py-12">Loading user settings...</div>
          ) : (
            <>
              {/* Goal Name */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  <Label className="text-white text-sm">Goal Name</Label>
                </div>
                <Input
                  placeholder="e.g., Emergency Fund, New Laptop, Vacation..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm mt-1 focus:ring-0"
                />
              </div>

              {/* Target Amount */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <Label className="text-white text-sm">Target Amount</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="25000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                    className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm focus:ring-0 flex-1 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  <span className="text-gray-400 text-sm">{userConfig ? `${userConfig.currency} (${getCurrencySymbol()})` : 'NOK (kr)'}</span>
                </div>
              </div>

              {/* Category */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <button
                  onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryData(formData.category).icon}</span>
                    <Label className="text-white text-sm">Category</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">{getCategoryData(formData.category).label}</span>
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                  </div>
                </button>
                {showCategoryPicker && (
                  <div className="mt-2 space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category: category.value as CategoryType }))
                          setShowCategoryPicker(false)
                        }}
                        className="w-full text-left px-2 py-1 text-white hover:bg-white/10 rounded-lg text-sm flex items-center space-x-2"
                      >
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <button
                  onClick={() => setShowPriorityPicker(!showPriorityPicker)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const Icon = getPriorityData(formData.priority).icon
                      return <Icon className={`h-4 w-4 ${getPriorityData(formData.priority).color}`} />
                    })()}
                    <Label className="text-white text-sm">Priority</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">{getPriorityData(formData.priority).label.replace(' Priority', '')}</span>
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                  </div>
                </button>
                {showPriorityPicker && (
                  <div className="mt-2 space-y-1">
                    {priorities.map((priority) => {
                      const Icon = priority.icon
                      return (
                        <button
                          key={priority.value}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, priority: priority.value as PriorityType }))
                            setShowPriorityPicker(false)
                          }}
                          className="w-full text-left px-2 py-1 text-white hover:bg-white/10 rounded-lg text-sm flex items-center space-x-2"
                        >
                          <Icon className={`h-3 w-3 ${priority.color}`} />
                          <span>{priority.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <Label className="text-white text-sm mb-2 block">Description (Optional)</Label>
                <Textarea
                  placeholder="Add details about your goal..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm focus:ring-0 min-h-[60px] resize-none"
                  rows={3}
                />
              </div>

              {/* Deadline */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <Label className="text-white text-sm">Target Date (Optional)</Label>
                  </div>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="bg-transparent border-none text-white text-right focus:ring-0 w-auto text-sm"
                  />
                </div>
              </div>

              {/* External URL */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                  <Label className="text-white text-sm">Link (Optional)</Label>
                </div>
                <Input
                  type="url"
                  placeholder="https://example.com/product"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                  className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm focus:ring-0"
                />
              </div>

              {/* Image URL */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="h-4 w-4 text-gray-400">🖼️</div>
                  <Label className="text-white text-sm">Goal Image (Optional)</Label>
                </div>
                <Input
                  type="url"
                  placeholder="https://images.example.com/dream-goal.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm focus:ring-0"
                />
                <p className="text-xs text-gray-500 mt-1">Paste any image URL from Google Images, Pinterest, etc.</p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!formData.name.trim() || !formData.targetAmount}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 