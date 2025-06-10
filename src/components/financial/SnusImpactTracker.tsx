'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign, TrendingDown, AlertCircle, Target, Package, Calendar } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'

// Your actual financial data
const SNUS_COST_NOK = 4.22  // 97 NOK ÷ 23 snus
const HOURLY_RATE_NOK = 179.64  // 30,000 NOK ÷ 167 hours
const MINUTES_PER_SNUS = (SNUS_COST_NOK / HOURLY_RATE_NOK) * 60 // 1.41 minutes
const SNUS_PER_PACKET = 23
const PACKET_COST_NOK = 97

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

export default function SnusImpactTracker() {
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
      const packetsBought = Math.ceil(totalCount / SNUS_PER_PACKET)

      // Calculate costs
      const costToday = todayCount * SNUS_COST_NOK
      const costWeek = weekCount * SNUS_COST_NOK
      const costMonth = monthCount * SNUS_COST_NOK
      const costTotal = totalCount * SNUS_COST_NOK

      // Calculate time wasted (in minutes)
      const minutesToday = costToday / HOURLY_RATE_NOK * 60
      const minutesWeek = costWeek / HOURLY_RATE_NOK * 60
      const minutesMonth = costMonth / HOURLY_RATE_NOK * 60

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
    return `kr${Math.round(amount).toLocaleString()}`
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const getMotivationalMessage = () => {
    const messages = [
      `${impactData.packetsBought} packets bought = ${formatCurrency(impactData.packetsBought * PACKET_COST_NOK)}`,
      `Each snus costs ${MINUTES_PER_SNUS.toFixed(1)} minutes of your life`,
      `${impactData.snusAvoided} snus avoided = ${formatCurrency(impactData.snusAvoided * SNUS_COST_NOK)} saved!`,
      `You've worked ${formatTime(impactData.costTotal / HOURLY_RATE_NOK * 60)} just for snus`,
      `${impactData.totalCount} snus over ${impactData.daysTracked} days tracked`
    ]
    return messages[Math.floor(Date.now() / 10000) % messages.length] // Rotate every 10 seconds
  }

  if (loading) {
    return (
      <Card className="bg-black/60 border border-white/10 backdrop-blur-xl h-full overflow-hidden rounded-xl">
        <CardContent className="p-3">
          <div className="animate-pulse text-center text-white/60 text-sm">
            Loading real data...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/60 border border-white/10 backdrop-blur-xl h-full overflow-hidden rounded-xl">
      <CardContent className="p-3 h-full flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-orange-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Snus Impact</h3>
              <p className="text-xs text-gray-400">Real usage analysis</p>
            </div>
          </div>
          <Badge className="bg-orange-500/20 text-orange-400 px-2 py-1 text-xs rounded">
            {impactData.daysTracked} days tracked
          </Badge>
        </div>

        {/* Time Period Stats */}
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {/* Today */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400 mb-1">Today</div>
              <div className="text-lg font-bold text-red-400">{impactData.todayCount}</div>
              <div className="text-xs text-gray-400">{formatCurrency(impactData.costToday)}</div>
            </div>

            {/* This Week */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400 mb-1">Week</div>
              <div className="text-lg font-bold text-orange-400">{impactData.weekCount}</div>
              <div className="text-xs text-gray-400">{formatCurrency(impactData.costWeek)}</div>
            </div>

            {/* This Month */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400 mb-1">Month</div>
              <div className="text-lg font-bold text-yellow-400">{impactData.monthCount}</div>
              <div className="text-xs text-gray-400">{formatCurrency(impactData.costMonth)}</div>
            </div>
          </div>
        </div>

        {/* Packets & Total Impact */}
        <div className="mb-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1">
                <Package className="h-3 w-3 text-red-400" />
                <span className="text-xs text-gray-400">Total Damage</span>
              </div>
              <span className="text-xs text-red-400">{impactData.packetsBought} packets</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-gray-400">Total snus</div>
                <div className="text-xl font-bold text-red-400">{impactData.totalCount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Total cost</div>
                <div className="text-xl font-bold text-red-400">{formatCurrency(impactData.costTotal)}</div>
              </div>
            </div>

            {/* Packet Visualization */}
            <div className="mb-3">
              <div className="text-xs text-gray-400 mb-2">Packets bought:</div>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: Math.min(impactData.packetsBought, 12) }).map((_, index) => (
                  <div key={index} className="w-4 h-3 bg-red-400/60 border border-red-400 rounded-sm" />
                ))}
                {impactData.packetsBought > 12 && (
                  <div className="text-xs text-red-400 ml-1">+{impactData.packetsBought - 12} more</div>
                )}
              </div>
            </div>
            
            {/* Cost Comparison */}
            <div className="bg-black/30 rounded-lg p-2">
              <div className="text-xs text-gray-400 mb-1">That money could have bought:</div>
              <div className="text-xs text-gray-300">
                {impactData.costTotal >= 200 && impactData.costTotal < 500 && "🛒 A week of groceries"}
                {impactData.costTotal >= 500 && impactData.costTotal < 1000 && "🍕 20+ restaurant meals"}
                {impactData.costTotal >= 1000 && impactData.costTotal < 2000 && "🎮 A PlayStation 5"}
                {impactData.costTotal >= 2000 && impactData.costTotal < 5000 && "✈️ A weekend trip to Europe"}
                {impactData.costTotal >= 5000 && "🏖️ A vacation abroad"}
                {impactData.costTotal < 200 && "☕ A few coffee shop visits"}
              </div>
            </div>
          </div>
        </div>

        {/* Work Time Wasted */}
        <div className="mb-4">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center">
            <Clock className="h-3 w-3 mr-1 text-blue-400" />
            Work Time Wasted
          </h4>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-xs text-gray-400">This week</div>
                <div className="text-sm font-bold text-blue-400">{formatTime(impactData.minutesWeek)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">This month</div>
                <div className="text-sm font-bold text-blue-400">{formatTime(impactData.minutesMonth)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Positive Progress */}
        <div className="mb-4">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center">
            <Target className="h-3 w-3 mr-1 text-green-400" />
            Improvement Metrics
          </h4>
          
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            {/* Money Actually Saved */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-lg font-bold text-green-400">{formatCurrency(impactData.snusAvoided * SNUS_COST_NOK)}</div>
                <div className="text-xs text-gray-400">money saved by reducing usage</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-400">{impactData.snusAvoided}</div>
                <div className="text-xs text-gray-400">snus avoided</div>
              </div>
            </div>

            {/* Baseline Explanation */}
            <div className="bg-black/30 rounded-lg p-2 mb-3">
              <div className="text-xs text-gray-400 mb-1">Your personal baseline:</div>
              <div className="text-sm text-white">
                <span className="text-yellow-400 font-bold">{impactData.baselineSnusPerDay}</span> snus/day
                <span className="text-gray-400 ml-1">(your historical average)</span>
              </div>
            </div>

            {/* Progress Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-sm font-bold text-green-400">
                  {Math.ceil(impactData.snusAvoided / SNUS_PER_PACKET)}
                </div>
                <div className="text-xs text-gray-400">packets avoided</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-green-400">
                  {formatTime((impactData.snusAvoided * SNUS_COST_NOK) / HOURLY_RATE_NOK * 60)}
                </div>
                <div className="text-xs text-gray-400">time saved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Motivational Message */}
        <div className="flex-1 flex items-end">
          <div className="w-full bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-3 w-3 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">Reality Check</span>
            </div>
            <div className="text-sm text-white">
              {getMotivationalMessage()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 