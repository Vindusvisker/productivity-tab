'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Calendar, CreditCard, Grid3X3, RotateCcw, Bell, ChevronDown, ChevronRight } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import { UserConfig } from '../../types/UserConfig'

interface Subscription {
  id: string
  name: string
  price: number
  renewalDate: string
  startDate: string
  icon: string
  color: string
  status: 'active' | 'upcoming' | 'overdue'
  daysUntilRenewal: number
  category?: string
  paymentMethod?: string
  billingCycle: 'monthly' | 'yearly' | 'weekly'
  reminderEnabled: boolean
}

interface AddSubscriptionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubscriptionAdded: (subscription: Subscription) => void
  editingSubscription?: Subscription | null
  onSubscriptionUpdated?: (subscription: Subscription) => void
  userConfig?: UserConfig | null
}

const iconOptions = ['💻', '📱', '🎵', '🎬', '🏃', '☁️', '🛡️', '🏠', '📚', '🤖']

const colorOptions = [
  { name: 'Gray', value: 'bg-gray-500', selected: 'bg-gray-600' },
  { name: 'Red', value: 'bg-red-500', selected: 'bg-red-600' },
  { name: 'Orange', value: 'bg-orange-500', selected: 'bg-orange-600' },
  { name: 'Green', value: 'bg-green-500', selected: 'bg-green-600' },
  { name: 'Cyan', value: 'bg-cyan-400', selected: 'bg-cyan-500' },
  { name: 'Blue', value: 'bg-blue-500', selected: 'bg-blue-600' },
  { name: 'Purple', value: 'bg-purple-500', selected: 'bg-purple-600' },
]

const categories = ['Entertainment', 'Productivity', 'Health & Fitness', 'Utilities', 'Food & Drink', 'Transportation', 'Other']
const paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Other']

export default function AddSubscriptionDialog({ isOpen, onClose, onSubscriptionAdded, editingSubscription, onSubscriptionUpdated, userConfig }: AddSubscriptionDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    icon: '💻',
    color: 'bg-blue-500',
    startDate: new Date().toISOString().split('T')[0],
    billingCycle: 'monthly' as 'monthly' | 'yearly' | 'weekly',
    category: '',
    paymentMethod: '',
    reminderEnabled: true,
    isPaid: true
  })

  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showPaymentPicker, setShowPaymentPicker] = useState(false)

  // Get currency symbol and label from user config
  const getCurrencySymbol = () => {
    if (!userConfig) return 'kr'
    switch (userConfig.currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'SEK': return 'kr'
      case 'NOK': 
      default: return 'kr'
    }
  }

  const getCurrencyLabel = () => {
    if (!userConfig) return 'NOK (kr)'
    switch (userConfig.currency) {
      case 'USD': return 'USD ($)'
      case 'EUR': return 'EUR (€)'
      case 'SEK': return 'SEK (kr)'
      case 'NOK': 
      default: return 'NOK (kr)'
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      icon: '💻',
      color: 'bg-blue-500',
      startDate: new Date().toISOString().split('T')[0],
      billingCycle: 'monthly',
      category: '',
      paymentMethod: '',
      reminderEnabled: true,
      isPaid: true
    })
    setShowIconPicker(false)
    setShowCategoryPicker(false)
    setShowPaymentPicker(false)
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    } else if (editingSubscription) {
      // Pre-fill form with existing subscription data
      setFormData({
        name: editingSubscription.name,
        price: editingSubscription.price.toString(),
        icon: editingSubscription.icon,
        color: editingSubscription.color,
        startDate: editingSubscription.startDate || editingSubscription.renewalDate,
        billingCycle: editingSubscription.billingCycle,
        category: editingSubscription.category || '',
        paymentMethod: editingSubscription.paymentMethod || '',
        reminderEnabled: editingSubscription.reminderEnabled,
        isPaid: editingSubscription.price > 0
      })
    }
  }, [isOpen, editingSubscription])

  const calculateRenewalDate = () => {
    const startDate = new Date(formData.startDate)
    startDate.setHours(0, 0, 0, 0)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // If start date is in the future, just add one billing cycle
    if (startDate > today) {
      const nextRenewal = new Date(startDate)
      if (formData.billingCycle === 'monthly') {
        nextRenewal.setMonth(nextRenewal.getMonth() + 1)
      } else if (formData.billingCycle === 'yearly') {
        nextRenewal.setFullYear(nextRenewal.getFullYear() + 1)
      } else if (formData.billingCycle === 'weekly') {
        nextRenewal.setDate(nextRenewal.getDate() + 7)
      }
      return nextRenewal.toISOString().split('T')[0]
    }
    
    // For past/current dates, calculate the next renewal based on billing cycles
    let nextRenewal = new Date(startDate)
    
    if (formData.billingCycle === 'weekly') {
      // Calculate how many weeks have passed
      const weeksPassed = Math.floor((today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      nextRenewal.setDate(startDate.getDate() + (weeksPassed + 1) * 7)
    } else if (formData.billingCycle === 'monthly') {
      // Better monthly calculation - preserve the day of month
      const startDay = startDate.getDate()
      const startMonth = startDate.getMonth()
      const startYear = startDate.getFullYear()
      
      let targetMonth = startMonth
      let targetYear = startYear
      
      // Keep adding months until we get a future date
      do {
        targetMonth++
        if (targetMonth > 11) {
          targetMonth = 0
          targetYear++
        }
        
        // Create the renewal date for this month
        nextRenewal = new Date(targetYear, targetMonth, 1) // Start with 1st of month
        nextRenewal.setDate(startDay) // Set to the same day
        
        // Handle cases where the day doesn't exist (e.g., Feb 30th -> Feb 28th/29th)
        if (nextRenewal.getDate() !== startDay) {
          // Go to the last day of the month
          nextRenewal = new Date(targetYear, targetMonth + 1, 0)
        }
        
      } while (nextRenewal <= today)
      
    } else if (formData.billingCycle === 'yearly') {
      // Calculate how many years have passed
      let yearsPassed = 0
      const tempDate = new Date(startDate)
      while (tempDate <= today) {
        tempDate.setFullYear(tempDate.getFullYear() + 1)
        yearsPassed++
      }
      nextRenewal.setFullYear(startDate.getFullYear() + yearsPassed)
    }
    
    return nextRenewal.toISOString().split('T')[0]
  }

  const calculateDaysUntilRenewal = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Start of day
    
    const renewalDateString = calculateRenewalDate()
    const renewal = new Date(renewalDateString)
    renewal.setHours(0, 0, 0, 0) // Start of day
    
    const diffTime = renewal.getTime() - today.getTime()
    const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, daysDiff) // Never return negative days
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || (formData.isPaid && !formData.price)) {
      return // Basic validation
    }

    const renewalDate = calculateRenewalDate()
    const daysUntilRenewal = calculateDaysUntilRenewal()

    if (editingSubscription) {
      // Update existing subscription
      const updatedSubscription: Subscription = {
        ...editingSubscription,
        name: formData.name.trim(),
        price: formData.isPaid ? parseFloat(formData.price) || 0 : 0,
        renewalDate: renewalDate,
        startDate: formData.startDate,
        icon: formData.icon,
        color: formData.color,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        billingCycle: formData.billingCycle,
        reminderEnabled: formData.reminderEnabled,
        daysUntilRenewal: daysUntilRenewal,
        status: daysUntilRenewal <= 0 ? 'overdue' : daysUntilRenewal <= 7 ? 'upcoming' : 'active'
      }

      try {
        const subscriptions = await storage.load('subscriptions') || []
        const updatedSubscriptions = subscriptions.map((sub: Subscription) => 
          sub.id === editingSubscription.id ? updatedSubscription : sub
        )
        await storage.save('subscriptions', updatedSubscriptions)
        
        if (onSubscriptionUpdated) {
          onSubscriptionUpdated(updatedSubscription)
        }
        onClose()
      } catch (error) {
        console.error('Error updating subscription:', error)
      }
    } else {
      // Create new subscription
      const newSubscription: Subscription = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        price: formData.isPaid ? parseFloat(formData.price) || 0 : 0,
        renewalDate: renewalDate,
        startDate: formData.startDate,
        icon: formData.icon,
        color: formData.color,
        status: daysUntilRenewal <= 0 ? 'overdue' : daysUntilRenewal <= 7 ? 'upcoming' : 'active',
        daysUntilRenewal: daysUntilRenewal,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        billingCycle: formData.billingCycle,
        reminderEnabled: formData.reminderEnabled
      }

      try {
        const existingSubscriptions = await storage.load('subscriptions') || []
        const updatedSubscriptions = [...existingSubscriptions, newSubscription]
        await storage.save('subscriptions', updatedSubscriptions)
        
        onSubscriptionAdded(newSubscription)
        onClose()
      } catch (error) {
        console.error('Error saving subscription:', error)
      }
    }
  }

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString)
    // European format: DD/MM/YYYY
    return date.toLocaleDateString('no-NO', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
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
              {editingSubscription ? 'Edit Subscription' : 'Add Subscription'}
            </DialogTitle>
            <div className="w-12" /> {/* Spacer */}
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Icon and Name Section */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className={`w-12 h-12 ${formData.color} rounded-full flex items-center justify-center text-xl hover:opacity-80 transition-opacity`}
            >
              {formData.icon}
            </button>
            
            <div className="flex-1">
              <Input
                placeholder="Subscription Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-base rounded-lg"
              />
            </div>
          </div>

          {/* Icon Picker */}
          {showIconPicker && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-8 gap-1">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, icon }))
                      setShowIconPicker(false)
                    }}
                    className="w-7 h-7 flex items-center justify-center text-base hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Picker */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`w-7 h-7 ${color.value} rounded-full border-2 ${
                    formData.color === color.value ? 'border-white' : 'border-transparent'
                  } hover:scale-110 transition-transform`}
                />
              ))}
            </div>
          </div>

          {/* Paid/Free Trial Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setFormData(prev => ({ ...prev, isPaid: true }))}
              variant="outline"
              className={`${
                formData.isPaid 
                  ? 'bg-white/20 border-white/30 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-400'
              } rounded-lg py-2 text-sm`}
            >
              Paid
            </Button>
            <Button
              onClick={() => setFormData(prev => ({ ...prev, isPaid: false }))}
              variant="outline"
              className={`${
                !formData.isPaid 
                  ? 'bg-white/20 border-white/30 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-400'
              } rounded-lg py-2 text-sm`}
            >
              Free Trial
            </Button>
          </div>

          {/* Amount Field */}
          {formData.isPaid && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <Label className="text-white text-sm">Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="bg-transparent border-none text-white placeholder:text-gray-400 text-right flex-1 focus:ring-0 text-sm appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
                <span className="text-gray-400 text-sm">{getCurrencyLabel()}</span>
              </div>
            </div>
          )}

          {/* Start Date */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Label className="text-white text-sm">Start date</Label>
              </div>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-transparent border-none text-white text-right focus:ring-0 w-auto text-sm"
              />
            </div>
          </div>

          {/* Billing Cycle */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4 text-gray-400" />
                <Label className="text-white text-sm">Billing cycle</Label>
              </div>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value as 'monthly' | 'yearly' | 'weekly' }))}
                className="bg-transparent border-none text-white text-right focus:ring-0 focus:outline-none text-sm"
              >
                <option value="weekly" className="bg-black">Weekly</option>
                <option value="monthly" className="bg-black">Monthly</option>
                <option value="yearly" className="bg-black">Yearly</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <button
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <Grid3X3 className="h-4 w-4 text-gray-400" />
                <Label className="text-white text-sm">Category</Label>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">{formData.category || 'None'}</span>
                <ChevronRight className="h-3 w-3 text-gray-400" />
              </div>
            </button>
            
            {showCategoryPicker && (
              <div className="mt-2 space-y-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, category }))
                      setShowCategoryPicker(false)
                    }}
                    className="w-full text-left px-2 py-1 text-white hover:bg-white/10 rounded-lg text-sm"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <button
              onClick={() => setShowPaymentPicker(!showPaymentPicker)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <Label className="text-white text-sm">Payment Method</Label>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">{formData.paymentMethod || 'None'}</span>
                <ChevronRight className="h-3 w-3 text-gray-400" />
              </div>
            </button>
            
            {showPaymentPicker && (
              <div className="mt-2 space-y-1">
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, paymentMethod: method }))
                      setShowPaymentPicker(false)
                    }}
                    className="w-full text-left px-2 py-1 text-white hover:bg-white/10 rounded-lg text-sm"
                  >
                    {method}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Renewal Reminder */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-gray-400" />
                <Label className="text-white text-sm">Renewal reminder</Label>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, reminderEnabled: !prev.reminderEnabled }))}
                className={`w-10 h-5 rounded-full transition-colors ${
                  formData.reminderEnabled ? 'bg-green-500' : 'bg-gray-600'
                } relative`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                  formData.reminderEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          {/* Add Button */}
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || (formData.isPaid && !formData.price)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {editingSubscription ? 'Update Subscription' : 'Add Subscription'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 