'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, ChevronRight, TrendingUp } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import AddSubscriptionDialog from './AddSubscriptionDialog'
import SubscriptionDetailsDialog from './SubscriptionDetailsDialog'

interface Subscription {
  id: string
  name: string
  price: number
  renewalDate: string
  icon: string
  color: string
  status: 'active' | 'upcoming' | 'overdue'
  daysUntilRenewal: number
  category?: string
  paymentMethod?: string
  billingCycle: 'monthly' | 'yearly' | 'weekly'
  reminderEnabled: boolean
}

// Fallback data for first-time users
const defaultSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Forsikring',
    price: 210.00,
    renewalDate: '2024-01-18',
    icon: '🏥',
    color: 'bg-blue-500',
    status: 'upcoming',
    daysUntilRenewal: 3,
    billingCycle: 'monthly',
    reminderEnabled: true
  },
  {
    id: '2',
    name: 'Ice Mobil',
    price: 428.00,
    renewalDate: '2024-06-17',
    icon: '📱',
    color: 'bg-orange-500',
    status: 'active',
    daysUntilRenewal: 150,
    billingCycle: 'monthly',
    reminderEnabled: true
  },
  {
    id: '3',
    name: 'Cursor',
    price: 216.00,
    renewalDate: '2024-06-25',
    icon: '💻',
    color: 'bg-purple-500',
    status: 'active',
    daysUntilRenewal: 158,
    billingCycle: 'monthly',
    reminderEnabled: true
  },
  {
    id: '4',
    name: 'Trene Sammen',
    price: 250.00,
    renewalDate: '2024-06-28',
    icon: '🏃',
    color: 'bg-red-500',
    status: 'active',
    daysUntilRenewal: 161,
    billingCycle: 'monthly',
    reminderEnabled: true
  },
  {
    id: '5',
    name: 'ChatGPT',
    price: 270.00,
    renewalDate: '2024-06-30',
    icon: '🤖',
    color: 'bg-gray-800',
    status: 'active',
    daysUntilRenewal: 163,
    billingCycle: 'monthly',
    reminderEnabled: true
  },
  {
    id: '6',
    name: 'Spotify',
    price: 169.00,
    renewalDate: '2024-07-06',
    icon: '🎵',
    color: 'bg-green-500',
    status: 'active',
    daysUntilRenewal: 169,
    billingCycle: 'monthly',
    reminderEnabled: true
  }
]

export default function SubscriptionTracker() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [dueThisMonth, setDueThisMonth] = useState(0)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

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
        // First time user - use default data and save it
        const initialSubscriptions = defaultSubscriptions.map(sub => ({
          ...sub,
          daysUntilRenewal: calculateDaysUntilRenewal(sub.renewalDate),
          status: getSubscriptionStatus(sub.renewalDate)
        }))
        setSubscriptions(initialSubscriptions)
        await storage.save('subscriptions', initialSubscriptions)
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error)
      setSubscriptions(defaultSubscriptions)
    } finally {
      setLoading(false)
    }
  }

  const calculateDaysUntilRenewal = (renewalDate: string): number => {
    const today = new Date()
    const renewal = new Date(renewalDate)
    const diffTime = renewal.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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

  const handleSubscriptionDeleted = (subscriptionId: string) => {
    const updatedSubscriptions = subscriptions.filter(sub => sub.id !== subscriptionId)
    setSubscriptions(updatedSubscriptions)
  }

  const formatCurrency = (amount: number) => {
    return `kr${amount.toFixed(0).replace('.', ',')}`
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
      <Card className="bg-black/60 border border-white/10 backdrop-blur-xl h-full overflow-hidden rounded-xl">
        <CardContent className="p-3 h-full flex items-center justify-center">
          <div className="text-gray-400">Loading subscriptions...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-black/60 border border-white/10 backdrop-blur-xl h-full overflow-hidden rounded-xl">
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
            <Badge className="bg-blue-500/20 text-blue-400 px-2 py-1 text-xs rounded">
              {subscriptions.length} active
            </Badge>
          </div>

          {/* Overview Section - Compact */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Monthly Average */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                <div className="text-xs text-gray-400 mb-1">Monthly avg</div>
                <div className="text-lg font-bold text-white">{formatCurrency(monthlyTotal)}</div>
              </div>

              {/* Active Count */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                <div className="text-xs text-gray-400 mb-1">Active</div>
                <div className="text-lg font-bold text-white">{subscriptions.length}</div>
              </div>
            </div>

            {/* Due This Month - Smaller */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-2">
              <div className="text-xs text-gray-400 mb-1">Due this month</div>
              <div className="text-lg font-bold text-white">{formatCurrency(dueThisMonth)}</div>
            </div>
          </div>

          {/* Add Button - Compact */}
          <div className="mb-3">
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="w-full bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-lg"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add new
            </Button>
          </div>

          {/* Up Next - If any */}
          {upcomingSubscriptions.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-bold text-white mb-2">Up next</h4>
              <div className="bg-white/5 border border-white/10 rounded-lg p-2">
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
              <ChevronRight className="h-3 w-3 text-gray-400" />
            </div>

            <div className="space-y-2">
              {subscriptions.map((sub) => {
                const renewalInfo = getRenewalText(sub)
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSubscriptionClick(sub)}
                    className="bg-white/5 border border-white/10 rounded-lg p-2 hover:bg-white/10 transition-all cursor-pointer"
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
        onClose={() => setShowAddDialog(false)}
        onSubscriptionAdded={handleSubscriptionAdded}
      />

      {/* Subscription Details Dialog */}
      <SubscriptionDetailsDialog
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        subscription={selectedSubscription}
        onSubscriptionUpdated={handleSubscriptionUpdated}
        onSubscriptionDeleted={handleSubscriptionDeleted}
      />
    </>
  )
} 