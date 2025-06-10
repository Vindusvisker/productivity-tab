'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, ChevronRight, TrendingUp } from 'lucide-react'

interface Subscription {
  id: string
  name: string
  price: number
  renewalDate: string
  icon: string
  color: string
  status: 'active' | 'upcoming' | 'overdue'
  daysUntilRenewal: number
}

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Forsikring',
    price: 210.00,
    renewalDate: '2024-01-18',
    icon: '🏥',
    color: 'bg-blue-500',
    status: 'upcoming',
    daysUntilRenewal: 3
  },
  {
    id: '2',
    name: 'Ice Mobil',
    price: 428.00,
    renewalDate: '2024-06-17',
    icon: '📱',
    color: 'bg-orange-500',
    status: 'active',
    daysUntilRenewal: 150
  },
  {
    id: '3',
    name: 'Cursor',
    price: 216.00,
    renewalDate: '2024-06-25',
    icon: '💻',
    color: 'bg-purple-500',
    status: 'active',
    daysUntilRenewal: 158
  },
  {
    id: '4',
    name: 'Trene Sammen',
    price: 250.00,
    renewalDate: '2024-06-28',
    icon: '🏃',
    color: 'bg-red-500',
    status: 'active',
    daysUntilRenewal: 161
  },
  {
    id: '5',
    name: 'ChatGPT',
    price: 270.00,
    renewalDate: '2024-06-30',
    icon: '🤖',
    color: 'bg-gray-800',
    status: 'active',
    daysUntilRenewal: 163
  },
  {
    id: '6',
    name: 'Spotify',
    price: 169.00,
    renewalDate: '2024-07-06',
    icon: '🎵',
    color: 'bg-green-500',
    status: 'active',
    daysUntilRenewal: 169
  }
]

export default function SubscriptionTracker() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions)
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [dueThisMonth, setDueThisMonth] = useState(0)

  useEffect(() => {
    // Calculate totals
    const total = subscriptions.reduce((sum, sub) => sum + sub.price, 0)
    setMonthlyTotal(total)
    
    // Calculate due this month (subscriptions renewing within 30 days)
    const thisMonth = subscriptions
      .filter(sub => sub.daysUntilRenewal <= 30)
      .reduce((sum, sub) => sum + sub.price, 0)
    setDueThisMonth(thisMonth)
  }, [subscriptions])

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

  return (
    <Card className="bg-black/60 border border-white/10 backdrop-blur-xl h-full overflow-hidden rounded-xl">
      <CardContent className="p-3 h-full flex flex-col">
        
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
          <Button className="w-full bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-lg">
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
  )
} 