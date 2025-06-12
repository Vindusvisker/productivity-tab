'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, ChevronRight, TrendingUp, Filter, History } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import AddSubscriptionDialog from './AddSubscriptionDialog'
import SubscriptionDetailsDialog from './SubscriptionDetailsDialog'
import SubscriptionHistoryDialog from './SubscriptionHistoryDialog'
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

interface SubscriptionTrackerProps {
  userConfig?: UserConfig | null
}

// Demo subscription to show users the value
const defaultSubscriptions: Subscription[] = [
  {
    id: 'demo-netflix',
    name: 'Netflix',
    price: 179,
    renewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    icon: '🎬',
    color: 'bg-red-500',
    status: 'active' as const,
    daysUntilRenewal: 15,
    category: 'Entertainment',
    paymentMethod: 'Credit Card',
    billingCycle: 'monthly' as const,
    reminderEnabled: true
  }
]

export default function SubscriptionTracker({ userConfig }: SubscriptionTrackerProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [dueThisMonth, setDueThisMonth] = useState(0)
  const [dueThisYear, setDueThisYear] = useState(0)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentFilter, setCurrentFilter] = useState<'name' | 'price' | 'renewal'>('name')
  const [showFilterPicker, setShowFilterPicker] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)

  const filterOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'renewal', label: 'Renewal' }
  ]

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
      return `${symbol}${Math.round(amount).toLocaleString()}`
    }
    return `${Math.round(amount).toLocaleString()} ${symbol}`
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  useEffect(() => {
    if (subscriptions.length > 0) {
      calculateTotals()
    }
  }, [subscriptions])

  const loadSubscriptions = async () => {
    try {
      const saved = await storage.load('subscriptions')
      
      if (saved && saved.length > 0) {
        // Update days until renewal for existing subscriptions
        const updatedSubscriptions = saved.map((sub: Subscription) => ({
          ...sub,
          daysUntilRenewal: calculateDaysUntilRenewal(sub.renewalDate),
          status: getSubscriptionStatus(sub.renewalDate)
        }))
        setSubscriptions(updatedSubscriptions)
      } else {
        // Start with demo subscription for new users to show value
        const demoWithUpdatedDates = defaultSubscriptions.map(sub => ({
          ...sub,
          daysUntilRenewal: calculateDaysUntilRenewal(sub.renewalDate),
          status: getSubscriptionStatus(sub.renewalDate)
        }))
        setSubscriptions(demoWithUpdatedDates)
        // Save the demo subscription so it persists
        await storage.save('subscriptions', demoWithUpdatedDates)
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error)
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const calculateDaysUntilRenewal = (renewalDate: string): number => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Start of day to avoid timezone issues
    
    const renewal = new Date(renewalDate)
    renewal.setHours(0, 0, 0, 0) // Start of day to avoid timezone issues
    
    const diffTime = renewal.getTime() - today.getTime()
    const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return daysDiff // Allow negative values for overdue subscriptions
  }

  const getSubscriptionStatus = (renewalDate: string): 'active' | 'upcoming' | 'overdue' => {
    const daysUntil = calculateDaysUntilRenewal(renewalDate)
    if (daysUntil < 0) return 'overdue'
    if (daysUntil <= 7) return 'upcoming'
    return 'active'
  }

  const calculateTotals = () => {
    // Calculate totals
    const total = subscriptions.reduce((sum, sub) => sum + sub.price, 0)
    setMonthlyTotal(total)
    
    // Calculate due this month (subscriptions renewing within 30 days)
    const thisMonth = subscriptions
      .filter(sub => sub.daysUntilRenewal <= 30)
      .reduce((sum, sub) => sum + sub.price, 0)
    setDueThisMonth(thisMonth)
    
    // Calculate due this year (monthly total * months left in year including current month)
    const now = new Date()
    const currentMonth = now.getMonth() // 0-11
    const monthsLeftInYear = 12 - currentMonth // Including current month
    const thisYear = total * monthsLeftInYear
    setDueThisYear(thisYear)
  }

  const handleSubscriptionAdded = async (newSubscription: Subscription) => {
    const updatedSubscriptions = [...subscriptions, newSubscription]
    setSubscriptions(updatedSubscriptions)
    await storage.save('subscriptions', updatedSubscriptions)
  }

  const handleSubscriptionClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setShowDetailsDialog(true)
  }

  const handleSubscriptionUpdated = (updatedSubscription: Subscription) => {
    const updatedSubscriptions = subscriptions.map(sub => 
      sub.id === updatedSubscription.id ? updatedSubscription : sub
    )
    setSubscriptions(updatedSubscriptions)
  }

  const handleSubscriptionDeleted = async (subscriptionId: string) => {
    try {
      // Find the subscription to delete
      const subscriptionToDelete = subscriptions.find(sub => sub.id === subscriptionId)
      
      if (subscriptionToDelete) {
        // Calculate duration and total paid
        const startDate = new Date(subscriptionToDelete.renewalDate)
        const endDate = new Date()
        const durationDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Estimate total paid (rough calculation)
        const monthlyPrice = subscriptionToDelete.price
        const totalPaid = Math.max(monthlyPrice, (durationDays / 30) * monthlyPrice)
        
        // Create history entry
        const historyEntry = {
          id: subscriptionToDelete.id,
          name: subscriptionToDelete.name,
          price: subscriptionToDelete.price,
          icon: subscriptionToDelete.icon,
          color: subscriptionToDelete.color,
          startDate: subscriptionToDelete.renewalDate,
          endDate: endDate.toISOString().split('T')[0],
          category: subscriptionToDelete.category,
          billingCycle: subscriptionToDelete.billingCycle,
          totalPaid: totalPaid,
          durationDays: Math.max(1, durationDays)
        }
        
        // Save to history
        const existingHistory = await storage.load('subscription-history') || []
        await storage.save('subscription-history', [...existingHistory, historyEntry])
      }
      
      // Remove from active subscriptions
      const updatedSubscriptions = subscriptions.filter(sub => sub.id !== subscriptionId)
      setSubscriptions(updatedSubscriptions)
      await storage.save('subscriptions', updatedSubscriptions)
    } catch (error) {
      console.error('Error deleting subscription:', error)
    }
  }

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setShowDetailsDialog(false)
    setShowAddDialog(true)
  }

  const handleSubscriptionEdited = (updatedSubscription: Subscription) => {
    handleSubscriptionUpdated(updatedSubscription)
    setEditingSubscription(null)
  }

  const getSortedSubscriptions = () => {
    const sorted = [...subscriptions]
    
    switch (currentFilter) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'price':
        return sorted.sort((a, b) => b.price - a.price) // High to low
      case 'renewal':
        return sorted.sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal) // Soonest first
      default:
        return sorted
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('nb-NO', { 
      day: 'numeric',
      month: 'short'
    })
  }

  const getRenewalText = (sub: Subscription) => {
    if (sub.daysUntilRenewal <= 7) {
      return { text: `${sub.daysUntilRenewal}d`, color: 'text-orange-400' }
    }
    return { text: formatDate(sub.renewalDate), color: 'text-gray-400' }
  }

  const upcomingSubscriptions = subscriptions
    .filter(sub => sub.daysUntilRenewal <= 7)
    .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)

  if (loading) {
    return (
      <Card className="bg-black/60 border border-white/10 backdrop-blur-xl h-full overflow-hidden rounded-2xl">
        <CardContent className="p-3 h-full flex items-center justify-center">
          <div className="text-gray-400">Loading subscriptions...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-black/60 border border-white/10 backdrop-blur-xl h-full overflow-hidden rounded-2xl">
        <CardContent className="p-3 h-full flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Recurring Payments</h3>
                <p className="text-xs text-gray-400">Monthly subscriptions</p>
              </div>
            </div>
            <button
              onClick={() => setShowHistoryDialog(true)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-2 py-1 text-xs rounded flex items-center space-x-1 transition-colors"
            >
              <History className="h-3 w-3" />
              <span>History</span>
            </button>
          </div>

          {/* Overview Section - Compact */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Monthly Average */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-2">
                <div className="text-xs text-gray-400 mb-1">Monthly avg</div>
                <div className="text-lg font-bold text-white">{formatCurrency(monthlyTotal)}</div>
              </div>

              {/* Active Count */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-2">
                <div className="text-xs text-gray-400 mb-1">Active</div>
                <div className="text-lg font-bold text-white">{subscriptions.length}</div>
              </div>
            </div>

            {/* Due This Month & Year - 2x1 Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-2">
                <div className="text-xs text-gray-400 mb-1">Due this month</div>
                <div className="text-lg font-bold text-white">{formatCurrency(dueThisMonth)}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-2">
                <div className="text-xs text-gray-400 mb-1">Due this year</div>
                <div className="text-lg font-bold text-white">{formatCurrency(dueThisYear)}</div>
              </div>
            </div>
          </div>

          {/* Add Button - Compact */}
          <div className="mb-3">
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="w-full bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-2xl"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add new
            </Button>
          </div>

          {/* Up Next - If any */}
          {upcomingSubscriptions.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-bold text-white mb-2">Up next</h4>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 ${upcomingSubscriptions[0].color} rounded-full flex items-center justify-center text-xs`}>
                      {upcomingSubscriptions[0].icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{upcomingSubscriptions[0].name}</div>
                      <div className="text-xs text-orange-400">In {upcomingSubscriptions[0].daysUntilRenewal}d</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-white">{formatCurrency(upcomingSubscriptions[0].price)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Subscriptions List - Compact */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white">Subscriptions</h4>
              <div className="relative">
                <button
                  onClick={() => setShowFilterPicker(!showFilterPicker)}
                  className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                >
                  <Filter className="h-3 w-3" />
                  <span className="text-xs">{filterOptions.find(f => f.value === currentFilter)?.label}</span>
                </button>
                
                {showFilterPicker && (
                  <div className="absolute right-0 top-6 bg-gray-800 border border-white/20 rounded-2xl p-2 z-10 min-w-[80px]">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setCurrentFilter(option.value as 'name' | 'price' | 'renewal')
                          setShowFilterPicker(false)
                        }}
                        className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                          currentFilter === option.value 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {getSortedSubscriptions().map((sub) => {
                const renewalInfo = getRenewalText(sub)
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSubscriptionClick(sub)}
                    className="bg-white/5 border border-white/10 rounded-2xl p-2 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 ${sub.color} rounded-full flex items-center justify-center text-xs`}>
                          {sub.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{sub.name}</div>
                          <div className={`text-xs ${renewalInfo.color}`}>{renewalInfo.text}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{formatCurrency(sub.price)}</div>
                        <div className="text-xs text-gray-400">Monthly</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Subscription Dialog */}
      <AddSubscriptionDialog
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false)
          setEditingSubscription(null)
        }}
        onSubscriptionAdded={handleSubscriptionAdded}
        editingSubscription={editingSubscription}
        onSubscriptionUpdated={handleSubscriptionEdited}
        userConfig={userConfig}
      />

      {/* Subscription Details Dialog */}
      <SubscriptionDetailsDialog
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        subscription={selectedSubscription}
        onSubscriptionUpdated={handleSubscriptionUpdated}
        onSubscriptionDeleted={handleSubscriptionDeleted}
        onEdit={handleEditSubscription}
        userConfig={userConfig}
      />

      {/* Subscription History Dialog */}
      {showHistoryDialog && (
        <SubscriptionHistoryDialog
          isOpen={showHistoryDialog}
          onClose={() => setShowHistoryDialog(false)}
          userConfig={userConfig}
        />
      )}
    </>
  )
} 