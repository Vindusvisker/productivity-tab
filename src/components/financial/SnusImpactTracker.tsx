'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign, TrendingDown, AlertCircle, Target, Package, Calendar } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import { UserConfig } from '../../types/UserConfig'

interface SnusImpactTrackerProps {
  userConfig?: UserConfig | null
}

interface SnusImpactData {
  todayCount: number
  weekCount: number
  monthCount: number
  totalCount: number
  packetsBought: number
  costToday: number
  costWeek: number
  costMonth: number
  costTotal: number
  minutesToday: number
  minutesWeek: number
  minutesMonth: number
  snusAvoided: number
  baselineSnusPerDay: number
  daysTracked: number
}

export default function SnusImpactTracker({ userConfig }: SnusImpactTrackerProps) {
  const [impactData, setImpactData] = useState<SnusImpactData>({
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
    totalCount: 0,
    packetsBought: 0,
    costToday: 0,
    costWeek: 0,
    costMonth: 0,
    costTotal: 0,
    minutesToday: 0,
    minutesWeek: 0,
    minutesMonth: 0,
    snusAvoided: 0,
    baselineSnusPerDay: 0,
    daysTracked: 0
  })
  const [loading, setLoading] = useState(true)

  // Don't render if user doesn't have addiction tracking enabled
  if (!userConfig?.hasAddiction) {
    return null
  }

  // Get user's configured values instead of hardcoded ones
  const COST_PER_UNIT = userConfig.costPerUnit
  const HOURLY_RATE = userConfig.hourlyRate
  const MINUTES_PER_UNIT = (COST_PER_UNIT / HOURLY_RATE) * 60
  const UNITS_PER_PACKAGE = userConfig.unitsPerPackage
  const PACKAGE_COST = userConfig.packageCost

  // Get display name for the habit
  const getHabitName = () => {
    if (userConfig.addictionName) {
      return userConfig.addictionName
    }
    
    switch (userConfig.addictionType) {
      case 'snus': return 'Snus'
      case 'tobacco': return 'Cigarette'
      case 'alcohol': return 'Drink'
      case 'gambling': return 'Gambling'
      case 'other': return 'Habit'
      default: return 'Snus'
    }
  }

  // Get currency symbol
  const getCurrencySymbol = () => {
    switch (userConfig.currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'SEK': return 'kr'
      case 'NOK': 
      default: return 'kr'
    }
  }

  useEffect(() => {
    calculateSnusImpact()
    
    // Listen for updates from SnusTracker and other components
    const handleUpdate = () => calculateSnusImpact()
    window.addEventListener('dailyLogsUpdated', handleUpdate)
    
    return () => window.removeEventListener('dailyLogsUpdated', handleUpdate)
  }, [])

  const calculateSnusImpact = async () => {
    try {
      // Load data from all sources like WeeklyOverview does
      const dailyLogs = await storage.load('daily-logs') || {}
      const snusData = await storage.load('snus-data') || {
        dailyCount: 0,
        totalDays: 0,
        successfulDays: 0,
        failedDays: 0,
        currentStreak: 0,
        lastDate: ''
      }
      
      // Get current date info
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const todayDateString = now.toDateString()
      const currentWeek = getWeekDates(now)
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      // Build complete data set by merging all sources (same logic as WeeklyOverview)
      const completeData: Record<string, { snusCount: number, date: string }> = {}
      
      // First, add all daily-logs data
      Object.values(dailyLogs).forEach((log: any) => {
        if (log.date && typeof log.snusCount === 'number') {
          completeData[log.date] = {
            date: log.date,
            snusCount: log.snusCount
          }
        }
      })

      // Add legacy day-data for the past 30 days to be thorough
      for (let i = 0; i < 30; i++) {
        const date = new Date(now)
        date.setDate(now.getDate() - i)
        const dateString = date.toDateString()
        const isoDate = date.toISOString().split('T')[0]
        
        try {
          const legacyData = await storage.load(`day-data-${dateString}`)
          if (legacyData && typeof legacyData.snusCount === 'number') {
            // Only use legacy data if we don't have unified data or if legacy is more recent
            if (!completeData[isoDate]) {
              completeData[isoDate] = {
                date: isoDate,
                snusCount: legacyData.snusCount
              }
            }
          }
        } catch (error) {
          // Ignore missing legacy data
        }
      }

      // Handle today's live data (same logic as WeeklyOverview)
      if (snusData.lastDate === todayDateString) {
        // Today is active in SnusTracker - use live count
        completeData[today] = {
          date: today,
          snusCount: snusData.dailyCount
        }
      } else if (!completeData[today]) {
        // No data for today yet, start with 0
        completeData[today] = {
          date: today,
          snusCount: 0
        }
      }

      // Convert to array for calculations
      const allLogs = Object.values(completeData).filter(log => log.snusCount >= 0)
      
      if (allLogs.length === 0) {
        setLoading(false)
        return
      }

      // Calculate baseline from all historical data (average daily usage)
      const historicalLogs = allLogs.filter(log => log.snusCount > 0) // Only days with snus data
      const totalHistoricalSnus = historicalLogs.reduce((sum, log) => sum + log.snusCount, 0)
      const baselineSnusPerDay = historicalLogs.length > 0 ? Math.round(totalHistoricalSnus / historicalLogs.length) : 5

      // Today's data
      const todayCount = completeData[today]?.snusCount || 0

      // This week's data
      const weekLogs = allLogs.filter(log => {
        return currentWeek.some(weekDate => 
          weekDate.toISOString().split('T')[0] === log.date
        )
      })
      const weekCount = weekLogs.reduce((sum, log) => sum + log.snusCount, 0)

      // This month's data
      const monthLogs = allLogs.filter(log => {
        const logDate = new Date(log.date)
        return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear
      })
      const monthCount = monthLogs.reduce((sum, log) => sum + log.snusCount, 0)

      // Total data
      const totalCount = allLogs.reduce((sum, log) => sum + log.snusCount, 0)
      
      // Calculate packets bought (round up since you have to buy full packets)
      const packetsBought = Math.ceil(totalCount / UNITS_PER_PACKAGE)

      // Calculate costs using user's configured values
      const costToday = todayCount * COST_PER_UNIT
      const costWeek = weekCount * COST_PER_UNIT
      const costMonth = monthCount * COST_PER_UNIT
      const costTotal = totalCount * COST_PER_UNIT

      // Calculate time wasted (in minutes) using user's hourly rate
      const minutesToday = costToday / HOURLY_RATE * 60
      const minutesWeek = costWeek / HOURLY_RATE * 60
      const minutesMonth = costMonth / HOURLY_RATE * 60

      // Calculate snus avoided (days where usage was below baseline)
      const totalSnusAvoided = allLogs.reduce((sum, log) => {
        const avoided = Math.max(0, baselineSnusPerDay - log.snusCount)
        return sum + avoided
      }, 0)

      // Days tracked
      const daysTracked = allLogs.length

      setImpactData({
        todayCount,
        weekCount,
        monthCount,
        totalCount,
        packetsBought,
        costToday,
        costWeek,
        costMonth,
        costTotal,
        minutesToday,
        minutesWeek,
        minutesMonth,
        snusAvoided: totalSnusAvoided,
        baselineSnusPerDay,
        daysTracked
      })
    } catch (error) {
      console.error('Error calculating snus impact:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get all dates in current week (Monday to Sunday)
  const getWeekDates = (date: Date): Date[] => {
    const dates = []
    const startOfWeek = new Date(date)
    const dayOfWeek = date.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startOfWeek.setDate(date.getDate() - daysFromMonday)
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      dates.push(day)
    }
    return dates
  }

  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol()} ${Math.round(amount).toLocaleString()}`
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  if (loading) {
    return (
      <Card className="bg-black/60 border border-white/10 backdrop-blur-xl h-full overflow-hidden rounded-2xl">
        <CardContent className="p-3">
          <div className="animate-pulse text-center text-white/60 text-sm">
            Loading real data...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/60 border border-white/10 backdrop-blur-xl h-full overflow-hidden rounded-2xl">
      <CardContent className="p-3 h-full flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-orange-400" />
            <div>
              <h3 className="text-sm font-bold text-white">{getHabitName()} Impact</h3>
              <p className="text-xs text-gray-400">Real usage analysis</p>
            </div>
          </div>
          <Badge className="bg-orange-500/20 text-orange-400 px-2 py-1 text-xs rounded">
            {impactData.daysTracked} days tracked
          </Badge>
        </div>

        {/* Content Area - fills remaining height */}
        <div className="flex-1">
          {/* Time Period Stats */}
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {/* Today */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-xs text-gray-400 mb-2">Today</div>
                <div className="text-2xl font-bold text-red-400">{impactData.todayCount}</div>
                <div className="text-xs text-gray-400 mt-2">{formatCurrency(impactData.costToday)}</div>
              </div>

              {/* This Week */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-xs text-gray-400 mb-2">Week</div>
                <div className="text-2xl font-bold text-orange-400">{impactData.weekCount}</div>
                <div className="text-xs text-gray-400 mt-2">{formatCurrency(impactData.costWeek)}</div>
              </div>

              {/* This Month */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-xs text-gray-400 mb-2">Month</div>
                <div className="text-2xl font-bold text-yellow-400">{impactData.monthCount}</div>
                <div className="text-xs text-gray-400 mt-2">{formatCurrency(impactData.costMonth)}</div>
              </div>
            </div>
          </div>

          {/* Packets & Total Impact */}
          <div className="mb-4">
            {(() => {
              // Determine card color based on monthly usage (20 packets = baseline monthly)
              const monthlyBaseline = 20
              let cardColor = 'bg-red-500/10 border-red-500/20' // Default red
              let textColor = 'text-red-400' // Default red text
              
              if (impactData.packetsBought < 5) {
                cardColor = 'bg-green-500/10 border-green-500/20' // Green for under 5
                textColor = 'text-green-400' // Green text
              } else if (impactData.packetsBought >= 5 && impactData.packetsBought <= 8) {
                cardColor = 'bg-yellow-500/10 border-yellow-500/20' // Yellow for 5-8
                textColor = 'text-yellow-400' // Yellow text
              }
              
              return (
                <div className={`${cardColor} rounded-2xl p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <Package className={`h-3 w-3 ${textColor}`} />
                      <span className="text-xs text-gray-400">Total Damage</span>
                    </div>
                    <span className={`text-xs ${textColor}`}>{impactData.packetsBought} packages</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <div className="text-xs text-gray-400">Total {getHabitName().toLowerCase()}</div>
                      <div className={`text-xl font-bold ${textColor}`}>{impactData.totalCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Total cost</div>
                      <div className={`text-xl font-bold ${textColor}`}>{formatCurrency(impactData.costTotal)}</div>
                    </div>
                  </div>

                  {/* Package Visualization */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">Packages bought:</div>
                    <div className="flex gap-0.5">
                      {/* Show current packets (colored to match theme) */}
                      {Array.from({ length: Math.min(impactData.packetsBought, userConfig?.previousMonthlyConsumption || 20) }).map((_, index) => {
                        // Use lighter colors for better visibility
                        let packetColor = 'bg-red-400/60 border-red-400' // Default red
                        if (impactData.packetsBought < 5) {
                          packetColor = 'bg-green-300/80 border-green-300' // Lighter green
                        } else if (impactData.packetsBought >= 5 && impactData.packetsBought <= 8) {
                          packetColor = 'bg-yellow-300/80 border-yellow-300' // Lighter yellow
                        }
                        
                        return (
                          <div key={`bought-${index}`} className={`flex-1 h-3 ${packetColor} rounded-sm`} />
                        )
                      })}
                      
                      {/* Show potential additional packets (gray) - based on previous consumption */}
                      {(() => {
                        const maxPotentialPackets = userConfig?.previousMonthlyConsumption || 20
                        const remainingPackets = Math.max(0, maxPotentialPackets - impactData.packetsBought)
                        const packetsToShow = Math.min(remainingPackets, (userConfig?.previousMonthlyConsumption || 20) - impactData.packetsBought)
                        
                        return Array.from({ length: Math.max(0, packetsToShow) }).map((_, index) => (
                          <div key={`potential-${index}`} className="flex-1 h-3 bg-gray-600/40 border border-gray-500/50 rounded-sm" />
                        ))
                      })()}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className={textColor}>{impactData.packetsBought} bought</span>
                      <span className="text-gray-400 ml-2">/ {userConfig?.previousMonthlyConsumption || 20} previous monthly consumption</span>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Reality Check - What You Could Have Bought Instead */}
          <div className="mb-4">
            <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-2 border-purple-500/30 rounded-2xl p-5 relative overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5 animate-pulse" />
              
              <div className="relative z-10">
                <div className="text-center mb-4">
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Reality Check</div>
                  <div className="text-sm text-gray-300 mb-3">That {formatCurrency(impactData.costTotal)} could have bought:</div>
                  
                  {/* Large prominent display of what could be bought */}
                  <div className="bg-black/40 border border-white/20 rounded-2xl p-4">
                    <div className="text-lg font-bold text-white leading-tight mb-2">
                      {impactData.costTotal < 250 && "☕ A few coffee shop visits"}
                      {impactData.costTotal >= 250 && impactData.costTotal < 500 && "🛒 4 days of groceries"}
                      {impactData.costTotal >= 500 && impactData.costTotal < 1000 && "🍕 2+ restaurant meals"}
                      {impactData.costTotal >= 1000 && impactData.costTotal < 1500 && "💪 4 months gym membership"}
                      {impactData.costTotal >= 1500 && impactData.costTotal < 2500 && "🎵 2 tickets to a concert"}
                      {impactData.costTotal >= 2500 && impactData.costTotal < 5000 && "🏠 Almost 1 month of rent"}
                      {impactData.costTotal >= 5000 && impactData.costTotal < 10000 && "✈️ A weekend trip to Europe"}
                      {impactData.costTotal >= 10000 && "🌍 A proper vacation abroad"}
                    </div>
                    
                    {/* Additional context based on amount */}
                    <div className="text-xs text-purple-300 mt-3 italic">
                      {impactData.costTotal < 250 && "Small pleasures you're missing out on"}
                      {impactData.costTotal >= 250 && impactData.costTotal < 500 && "Essential needs you could cover"}
                      {impactData.costTotal >= 500 && impactData.costTotal < 1000 && "Good times you could have had"}
                      {impactData.costTotal >= 1000 && impactData.costTotal < 1500 && "Health investments you could make"}
                      {impactData.costTotal >= 1500 && impactData.costTotal < 2500 && "Memorable experiences you could create"}
                      {impactData.costTotal >= 2500 && impactData.costTotal < 5000 && "Serious life expenses you could handle"}
                      {impactData.costTotal >= 5000 && impactData.costTotal < 10000 && "Amazing adventures you could take"}
                      {impactData.costTotal >= 10000 && "Life-changing experiences you could afford"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Work Time Wasted - Major Impact Display */}
          <div className="mb-3">
            <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 border-2 border-blue-500/30 rounded-2xl p-4 relative overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-teal-500/5 animate-pulse" />
              
              <div className="relative z-10">
                <div className="text-center mb-3">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Work Time Wasted</div>
                  <div className="text-xs text-gray-300 mb-3">Your {formatCurrency(impactData.costTotal)} = precious work hours lost</div>
                  
                  {/* Compact display of time wasted */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-black/40 border border-white/20 rounded-2xl p-3">
                      <div className="text-sm font-bold text-blue-400">
                        {formatTime(impactData.minutesWeek)}
                      </div>
                      <div className="text-xs text-gray-400">Week</div>
                    </div>
                    <div className="bg-black/40 border border-white/20 rounded-2xl p-3">
                      <div className="text-sm font-bold text-cyan-400">
                        {formatTime(impactData.minutesMonth)}
                      </div>
                      <div className="text-xs text-gray-400">Month</div>
                    </div>
                    <div className="bg-black/40 border border-white/20 rounded-2xl p-3">
                      <div className="text-sm font-bold text-teal-400">
                        {formatTime((impactData.costTotal / HOURLY_RATE) * 60)}
                      </div>
                      <div className="text-xs text-gray-400">Total</div>
                    </div>
                  </div>

                  {/* Compact context */}
                  <div className="text-xs text-blue-300 italic">
                    {impactData.costTotal < 100 && "Just a few coffee breaks worth of time"}
                    {impactData.costTotal >= 100 && impactData.costTotal < 300 && "Almost a full work morning lost"}
                    {impactData.costTotal >= 300 && impactData.costTotal < 500 && "A complete work day down the drain"}
                    {impactData.costTotal >= 500 && impactData.costTotal < 1000 && "Multiple work days you'll never get back"}
                    {impactData.costTotal >= 1000 && impactData.costTotal < 2000 && "A full work week wasted"}
                    {impactData.costTotal >= 2000 && impactData.costTotal < 5000 && "Weeks of your life traded for nothing"}
                    {impactData.costTotal >= 5000 && "Months of work time sacrificed for temporary hits"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 