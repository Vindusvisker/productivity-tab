'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Grid3X3, CreditCard, Bell } from 'lucide-react'
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

interface SubscriptionDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  subscription: Subscription | null
  onSubscriptionUpdated: (updatedSubscription: Subscription) => void
  onSubscriptionDeleted: (subscriptionId: string) => void
  onEdit: (subscription: Subscription) => void
  userConfig?: UserConfig | null
}

export default function SubscriptionDetailsDialog({ 
  isOpen, 
  onClose, 
  subscription,
  onSubscriptionUpdated,
  onSubscriptionDeleted,
  onEdit,
  userConfig
}: SubscriptionDetailsDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!subscription) return null

  // Get currency symbol from user config
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

  // Format currency using user's configured currency
  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol()
    if (symbol === '$' || symbol === '€') {
      return `${symbol}${amount.toFixed(2)}`
    }
    return `${amount.toFixed(2).replace('.', ',')} ${symbol}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short'
    })
  }

  const formatDateLong = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleMarkAsCancelled = async () => {
    // Toggle cancelled status (we can add a cancelled field)
    const updatedSubscription = {
      ...subscription,
      status: subscription.status === 'active' ? 'cancelled' as any : 'active'
    }

    try {
      const subscriptions = await storage.load('subscriptions') || []
      const updatedSubscriptions = subscriptions.map((sub: Subscription) => 
        sub.id === subscription.id ? updatedSubscription : sub
      )
      await storage.save('subscriptions', updatedSubscriptions)
      onSubscriptionUpdated(updatedSubscription)
    } catch (error) {
      console.error('Error updating subscription:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await onSubscriptionDeleted(subscription.id)
      onClose()
    } catch (error) {
      console.error('Error deleting subscription:', error)
    }
  }

  const getBillingCycleText = () => {
    switch (subscription.billingCycle) {
      case 'weekly': return 'Weekly'
      case 'monthly': return 'Monthly'
      case 'yearly': return 'Yearly'
      default: return 'Monthly'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-black text-white rounded-3xl p-0 overflow-hidden border border-white/20">
        
        {/* Dynamic Colored Header */}
        <div className={`${subscription.color} p-6 relative`}>
          {/* Back Button and Edit */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <button 
              onClick={() => onEdit(subscription)}
              className="text-white/80 hover:text-white text-lg"
            >
              Edit
            </button>
          </div>

          {/* Large Icon */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
              <div className={`w-12 h-12 ${subscription.color} rounded-full flex items-center justify-center text-2xl`}>
                {subscription.icon}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-2">{subscription.name}</h1>
            <p className="text-white/80 text-lg">Renews on {formatDateLong(subscription.renewalDate)}</p>
          </div>

          {/* Plan Info Card */}
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-white font-semibold text-lg">{getBillingCycleText()}</div>
                <div className="text-white/70 text-sm">Plan</div>
              </div>
              <div>
                <div className="text-white font-semibold text-lg">{formatCurrency(subscription.price)}</div>
                <div className="text-white/70 text-sm">Monthly</div>
              </div>
              <div>
                <div className="text-white font-semibold text-lg">Active</div>
                <div className="text-white/70 text-sm">Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 space-y-4">
          
          {/* Next Bill */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-white font-medium">Next bill</span>
              </div>
              <span className="text-gray-400">in {subscription.daysUntilRenewal} days</span>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Grid3X3 className="h-5 w-5 text-gray-400" />
                <span className="text-white font-medium">Category</span>
              </div>
              <span className="text-gray-400">{subscription.category || 'Utilities'}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <span className="text-white font-medium">Payment method</span>
              </div>
              <span className="text-gray-400">{subscription.paymentMethod || 'Vanlig Kort'}</span>
            </div>
          </div>

          {/* Renewal Reminder */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="text-white font-medium">Renewal reminder</span>
              </div>
              <span className="text-gray-400">{subscription.reminderEnabled ? 'On' : 'None'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-transparent hover:bg-red-500/20 text-red-400 py-4 rounded-2xl text-lg font-medium border border-red-500/30"
            >
              Delete Subscription
            </Button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-white text-lg font-bold mb-2">Delete Subscription</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to delete {subscription.name}? This action cannot be undone.</p>
              
              <div className="space-y-3">
                <Button
                  onClick={handleDelete}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 