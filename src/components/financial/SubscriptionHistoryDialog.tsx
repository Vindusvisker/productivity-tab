'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Trash2, History as HistoryIcon } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'

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

interface HistoricalSubscription {
  id: string
  name: string
  price: number
  icon: string
  color: string
  startDate: string
  endDate: string
  category?: string
  billingCycle: 'monthly' | 'yearly' | 'weekly'
  totalPaid: number
  durationDays: number
}

interface SubscriptionHistoryDialogProps {
  isOpen: boolean
  onClose: () => void
  userConfig?: UserConfig | null
}

export default function SubscriptionHistoryDialog({ isOpen, onClose, userConfig }: SubscriptionHistoryDialogProps) {
  const [historyList, setHistoryList] = useState<HistoricalSubscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadHistory()
    }
  }, [isOpen])

  const loadHistory = async () => {
    try {
      const history = await storage.load('subscription-history') || []
      setHistoryList(history)
    } catch (error) {
      console.error('Error loading subscription history:', error)
      setHistoryList([])
    } finally {
      setLoading(false)
    }
  }

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
      return `${symbol}${amount.toFixed(0)}`
    }
    return `${amount.toFixed(0).replace('.', ',')} ${symbol}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short'
    })
  }

  const getBillingCycleText = (cycle: string) => {
    switch (cycle) {
      case 'weekly': return 'Weekly'
      case 'monthly': return 'Monthly'
      case 'yearly': return 'Yearly'
      default: return 'Monthly'
    }
  }

  const clearHistory = async () => {
    try {
      await storage.save('subscription-history', [])
      setHistoryList([])
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-black/95 backdrop-blur-xl border border-white/20 text-white rounded-3xl p-6">
          <DialogTitle className="sr-only">Loading Subscription History</DialogTitle>
          <DialogDescription className="sr-only">Please wait while we load your subscription history</DialogDescription>
          <div className="flex items-center justify-center">
            <div className="text-gray-400">Loading history...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
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
            <DialogTitle className="text-lg font-bold">Subscription History</DialogTitle>
            <div className="w-12" />
          </div>
          <DialogDescription className="sr-only">
            View your cancelled subscription history with duration and payment details
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          
          {/* Summary */}
          {historyList.length > 0 && (
            <div className="mb-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">{historyList.length}</div>
                    <div className="text-xs text-gray-400">Cancelled</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      {formatCurrency(historyList.reduce((sum, sub) => sum + sub.totalPaid, 0))}
                    </div>
                    <div className="text-xs text-gray-400">Total paid</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History List */}
          {historyList.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <HistoryIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No History Yet</h3>
              <p className="text-gray-400 text-sm">
                Cancelled subscriptions will appear here with their lifecycle details.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white">Cancelled Subscriptions</h4>
                <Button
                  onClick={clearHistory}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>

              {historyList.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${sub.color} rounded-full flex items-center justify-center text-sm`}>
                        {sub.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{sub.name}</div>
                        <div className="text-xs text-gray-400">{getBillingCycleText(sub.billingCycle)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{formatCurrency(sub.price)}</div>
                      <div className="text-xs text-gray-400">per month</div>
                    </div>
                  </div>

                  {/* Duration & Dates */}
                  <div className="bg-white/5 rounded-lg p-2 mt-2">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-gray-400">Started</div>
                        <div className="text-xs font-medium text-white">{formatDateShort(sub.startDate)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Ended</div>
                        <div className="text-xs font-medium text-white">{formatDateShort(sub.endDate)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Duration</div>
                        <div className="text-xs font-medium text-white">{sub.durationDays}d</div>
                      </div>
                    </div>
                  </div>

                  {/* Total Paid */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                    <span className="text-xs text-gray-400">Total paid</span>
                    <span className="text-xs font-bold text-white">{formatCurrency(sub.totalPaid)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 