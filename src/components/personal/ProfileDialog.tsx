'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ClaimButton } from '@/components/ui/claim-button'
import { Star, Zap, Crown, Shield, TrendingUp, Trophy, Target, Flame, Calendar, Lock, Gift, Sparkles } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import HeroIcon, { getLevelTierInfo } from './HeroIcon'

interface ProfileData {
  level: number
  currentXP: number
  totalXP: number
  title: string
  rank: string
  completedMissions: number
  daysActive: number
  dailyXP: number
  dailyBonusXP: number
  weeklyBonusXP: number
  monthlyBonusXP: number
  streakXP: number
  missionXP: number
  achievementXP: number
}

interface ProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  profileData: ProfileData
}

export default function ProfileDialog({ isOpen, onClose, profileData }: ProfileDialogProps) {
  const [extendedStats, setExtendedStats] = useState({
    totalHabits: 0,
    totalFocus: 0,
    cleanDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    completedAchievements: 0,
    totalMissions: 0
  })

  const [rewardsData, setRewardsData] = useState({
    dailyBonusClaimed: false,
    dailyBonusResetTime: '',
    weeklyProgress: 0,
    weeklyTarget: 0,
    weeklyResetTime: '',
    weeklyBonusClaimed: false,
    monthlyResetTime: '',
    monthlyBonusClaimed: false,
    streakMultiplier: 1.0
  })

  useEffect(() => {
    if (isOpen) {
      loadExtendedStats()
      loadRewardsData()
    }
  }, [isOpen])

  const loadExtendedStats = async () => {
    try {
      // Load daily logs for calculations
      const dailyLogs = await storage.load('daily-logs') || {}
      const logs = Object.values(dailyLogs)
      
      // Calculate stats
      const totalHabits = logs.reduce((sum: number, log: any) => sum + log.habitsCompleted, 0)
      const totalFocus = logs.reduce((sum: number, log: any) => sum + log.focusSessions, 0)
      const cleanDays = logs.filter((log: any) => log.snusCount === 0).length
      
      // Load other data
      const unlockedAchievements = await storage.load('unlocked-achievements') || []
      const completedMissions = await storage.load('completed-missions') || []
      
      // Calculate streaks
      const currentStreak = calculateCurrentStreak(logs)
      const longestStreak = calculateLongestStreak(logs)
      
      setExtendedStats({
        totalHabits,
        totalFocus,
        cleanDays,
        currentStreak,
        longestStreak,
        completedAchievements: unlockedAchievements.length,
        totalMissions: completedMissions.length
      })
    } catch (error) {
      console.error('Error loading extended stats:', error)
    }
  }

  const calculateCurrentStreak = (logs: any[]): number => {
    if (logs.length === 0) return 0
    
    const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const getScore = (log: any) => log.habitsCompleted * 2 + log.focusSessions * 1 - log.snusCount * 1
    const today = new Date().toISOString().split('T')[0]
    
    let streak = 0
    for (const log of sortedLogs) {
      const score = getScore(log)
      const isToday = log.date === today
      
      if (isToday && score < 3) {
        continue
      }
      
      if (score >= 3) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const calculateLongestStreak = (logs: any[]): number => {
    if (logs.length === 0) return 0
    
    const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const getScore = (log: any) => log.habitsCompleted * 2 + log.focusSessions * 1 - log.snusCount * 1
    
    let maxStreak = 0
    let currentStreak = 0
    
    for (const log of sortedLogs) {
      if (getScore(log) >= 3) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }
    
    return maxStreak
  }

  const loadRewardsData = async () => {
    try {
      // Check daily bonus status
      const today = new Date().toISOString().split('T')[0]
      const lastClaimedDaily = await storage.load('last-daily-claim') || ''
      const dailyBonusClaimed = lastClaimedDaily === today
      
      // Check weekly bonus status
      const currentWeek = getWeekKey(new Date())
      const lastClaimedWeekly = await storage.load('last-weekly-claim') || ''
      const weeklyBonusClaimed = lastClaimedWeekly === currentWeek
      
      // Check monthly bonus status  
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
      const lastClaimedMonthly = await storage.load('last-monthly-claim') || ''
      const monthlyBonusClaimed = lastClaimedMonthly === currentMonth
      
      // Calculate daily reset time (next midnight)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      const hoursLeft = Math.floor((tomorrow.getTime() - Date.now()) / (1000 * 60 * 60))
      const minutesLeft = Math.floor(((tomorrow.getTime() - Date.now()) % (1000 * 60 * 60)) / (1000 * 60))
      const dailyBonusResetTime = `${hoursLeft}h ${minutesLeft}m`
      
      // Calculate weekly progress (based on current week's XP)
      const dailyLogs = await storage.load('daily-logs') || {}
      const logs = Object.values(dailyLogs as Record<string, any>)
      const weekLogs = getCurrentWeekLogs(logs)
      const weeklyProgress = weekLogs.reduce((sum, log) => sum + (log.habitsCompleted * 50 + log.focusSessions * 25), 0)
      const weeklyTarget = 1000 // 1000 XP per week for bonus
      
      // Calculate weekly reset time
      const nextMonday = new Date()
      const daysUntilMonday = (7 - nextMonday.getDay() + 1) % 7 || 7
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
      nextMonday.setHours(0, 0, 0, 0)
      const daysLeft = Math.floor((nextMonday.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      const weeklyHoursLeft = Math.floor(((nextMonday.getTime() - Date.now()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const weeklyResetTime = `${daysLeft}d ${weeklyHoursLeft}h`
      
      // Calculate monthly reset time
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1, 1)
      nextMonth.setHours(0, 0, 0, 0)
      const monthDaysLeft = Math.floor((nextMonth.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      const monthlyResetTime = `${monthDaysLeft}d`
      
      // Calculate real streak multiplier
      const currentStreak = calculateCurrentStreak(logs)
      const streakMultiplier = Math.min(1.0 + (currentStreak * 0.1), 3.0) // Max 3x multiplier
      
      setRewardsData({
        dailyBonusClaimed,
        dailyBonusResetTime,
        weeklyProgress,
        weeklyTarget,
        weeklyResetTime,
        weeklyBonusClaimed,
        monthlyResetTime,
        monthlyBonusClaimed,
        streakMultiplier
      })
    } catch (error) {
      console.error('Error loading rewards data:', error)
    }
  }

  const claimDailyBonus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      await storage.save('last-daily-claim', today)
      
      // Add daily bonus XP (base 100 + streak bonus)
      const bonusXP = Math.floor(100 * rewardsData.streakMultiplier)
      const currentDailyXP = await storage.load('daily-activity-xp') || 0
      await storage.save('daily-activity-xp', currentDailyXP + bonusXP)
      
      // Update rewards data
      setRewardsData(prev => ({ ...prev, dailyBonusClaimed: true }))
      
      // Trigger profile update
      window.dispatchEvent(new CustomEvent('dailyLogsUpdated'))
      
      console.log(`🎉 Daily bonus claimed: +${bonusXP} XP`)
    } catch (error) {
      console.error('Error claiming daily bonus:', error)
    }
  }

  const claimWeeklyBonus = async () => {
    try {
      const currentWeek = getWeekKey(new Date())
      await storage.save('last-weekly-claim', currentWeek)
      
      // Add weekly bonus XP
      const bonusXP = 1000
      const currentWeeklyXP = await storage.load('weekly-bonus-xp') || 0
      await storage.save('weekly-bonus-xp', currentWeeklyXP + bonusXP)
      
      // Update rewards data
      setRewardsData(prev => ({ ...prev, weeklyBonusClaimed: true }))
      
      // Trigger profile update
      window.dispatchEvent(new CustomEvent('dailyLogsUpdated'))
      
      console.log(`🎉 Weekly bonus claimed: +${bonusXP} XP`)
    } catch (error) {
      console.error('Error claiming weekly bonus:', error)
    }
  }

  const claimMonthlyBonus = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7)
      await storage.save('last-monthly-claim', currentMonth)
      
      // Add monthly bonus XP
      const bonusXP = 2000
      const currentMonthlyXP = await storage.load('monthly-bonus-xp') || 0
      await storage.save('monthly-bonus-xp', currentMonthlyXP + bonusXP)
      
      // Update rewards data
      setRewardsData(prev => ({ ...prev, monthlyBonusClaimed: true }))
      
      // Trigger profile update
      window.dispatchEvent(new CustomEvent('dailyLogsUpdated'))
      
      console.log(`🎉 Monthly bonus claimed: +${bonusXP} XP`)
    } catch (error) {
      console.error('Error claiming monthly bonus:', error)
    }
  }

  const getWeekKey = (date: Date) => {
    const year = date.getFullYear()
    const firstDayOfYear = new Date(year, 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
    return `${year}-W${weekNumber}`
  }

  const getCurrentWeekLogs = (logs: any[]) => {
    const today = new Date()
    const startOfWeek = new Date(today)
    const dayOfWeek = today.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startOfWeek.setDate(today.getDate() - daysFromMonday)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(today)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return logs.filter(log => {
      const logDate = new Date(log.date)
      logDate.setHours(12, 0, 0, 0)
      return logDate >= startOfWeek && logDate <= endOfWeek
    })
  }

  const currentTier = getLevelTierInfo(profileData.level)
  const nextLevel = profileData.level + 1
  const nextTier = getLevelTierInfo(nextLevel)
  const nextLevelXP = 1000
  const xpToNextLevel = nextLevelXP - profileData.currentXP
  const progressPercentage = (profileData.currentXP / nextLevelXP) * 100
  
  // Detect recent level up (low currentXP suggests they just leveled up)
  const recentLevelUp = profileData.currentXP < 100 && profileData.level > 1

  // Get major tier milestones
  const getMajorTierMilestones = () => {
    const tierBreakpoints = [1, 5, 10, 15, 20, 30, 40, 50, 100] // Major tier changes
    return tierBreakpoints
      .filter(level => level > profileData.level)
      .slice(0, 8) // Show ALL remaining tiers
      .map(level => ({
        level,
        ...getLevelTierInfo(level),
        xpRequired: (level - 1) * 1000,
        xpNeeded: (level - 1) * 1000 - profileData.totalXP
      }))
  }

  const getXPBreakdown = () => [
    { label: 'Daily Grind', value: profileData.dailyXP, color: 'text-green-400', icon: <Target className="h-4 w-4" /> },
    { label: 'Streak Multiplier', value: profileData.streakXP, color: 'text-orange-400', icon: <Flame className="h-4 w-4" /> },
    { label: 'Mission Bounties', value: profileData.missionXP, color: 'text-blue-400', icon: <TrendingUp className="h-4 w-4" /> },
    { label: 'Achievement Rewards', value: profileData.achievementXP, color: 'text-purple-400', icon: <Trophy className="h-4 w-4" /> }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 backdrop-blur-xl border-2 border-purple-500/30 text-white rounded-3xl p-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5" />
        
        <div className="flex h-[85vh] relative">
          {/* Left Panel - Current Status & Next Level Focus */}
          <div className="flex-1 p-8 border-r border-white/10">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-bold text-white flex items-center space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${currentTier.bgColor} rounded-full flex items-center justify-center shadow-2xl border-2 border-white/30`}>
                  <HeroIcon level={profileData.level} className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <span>{profileData.rank} Warrior</span>
                    <Badge className={`${currentTier.bgColor} text-white px-3 py-1 text-sm`}>
                      Level {profileData.level}
                    </Badge>
                  </div>
                  <div className="text-lg font-normal text-gray-300">{profileData.title}</div>
                </div>
              </DialogTitle>
            </DialogHeader>

            {/* NEXT LEVEL UNLOCK - Main Focus */}
            <div className={`bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border-2 border-yellow-500/30 rounded-2xl p-4 mb-4 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-red-500/5 animate-pulse" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Gift className={`h-5 w-5 text-yellow-400 ${xpToNextLevel < 500 ? 'animate-pulse' : ''}`} />
                    <span className="text-xs font-bold text-yellow-400">Next Level</span>
                  </div>
                  <div className={`flex items-center space-x-2 bg-gray-800/60 px-2 py-1 rounded-full ${xpToNextLevel < 500 ? 'animate-bounce' : ''}`}>
                    <Sparkles className={`h-3 w-3 text-cyan-400 ${xpToNextLevel < 500 ? 'animate-spin' : ''}`} />
                    <span className={`text-xs font-bold text-cyan-400`}>
                      {xpToNextLevel < 500 ? `ONLY ${xpToNextLevel.toLocaleString()} XP LEFT!` : `${xpToNextLevel.toLocaleString()} XP to go`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${nextTier.bgColor} rounded-xl flex items-center justify-center shadow-lg border border-white/20`}>
                    <HeroIcon level={nextLevel} className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className={`text-lg font-bold text-white`}>
                      Level {nextLevel} • {nextTier.tier}
                    </div>
                    <div className="text-xs text-gray-300">
                      {xpToNextLevel < 500 ? '✨ SO CLOSE TO UNLOCK! ✨' : `Unlock exclusive ${nextTier.tier} rewards`}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-800/60 rounded-full h-3 relative overflow-hidden border border-white/20 mb-2">
                  <div 
                    className={`bg-gradient-to-r from-white/60 via-white/80 to-white/60 h-full rounded-full transition-all duration-1000 relative`}
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse opacity-60"></div>
                  </div>
                  
                  {/* Progress Glow Effect */}
                  {progressPercentage > 0 && (
                    <div
                      className="absolute top-0 left-0 h-3 rounded-full blur-sm opacity-50"
                      style={{
                        width: `${progressPercentage}%`,
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.8), rgba(255,255,255,0.6))'
                      }}
                    />
                  )}
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-green-400 font-bold">{profileData.currentXP.toLocaleString()} XP</span>
                  <span className="text-yellow-400 font-bold">{nextLevelXP.toLocaleString()} XP</span>
                </div>
              </div>
            </div>

            {/* Daily Rewards & Bonuses */}
            <div className="space-y-4 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Gift className="h-5 w-5 mr-2 text-yellow-400" />
                Daily Rewards
              </h3>
              
              {/* Daily Bonus */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">Daily Bonus</span>
                    {rewardsData.streakMultiplier > 1.0 && (
                      <span className="text-xs bg-orange-500/20 border border-orange-500/30 px-1 py-0.5 rounded text-orange-400">
                        {rewardsData.streakMultiplier.toFixed(1)}x
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">Resets in {rewardsData.dailyBonusResetTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-green-400">+{Math.floor(100 * rewardsData.streakMultiplier)} XP</span>
                    {rewardsData.streakMultiplier > 1.0 && (
                      <div className="text-xs text-gray-400">Base 100 XP × {rewardsData.streakMultiplier.toFixed(1)}</div>
                    )}
                  </div>
                  <ClaimButton 
                    onClick={claimDailyBonus}
                    disabled={rewardsData.dailyBonusClaimed}
                  >
                    {rewardsData.dailyBonusClaimed ? 'Claimed' : 'Claim'}
                  </ClaimButton>
                </div>
              </div>

              {/* Weekly Bonus */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">Weekly Bonus</span>
                    {rewardsData.weeklyProgress >= rewardsData.weeklyTarget && !rewardsData.weeklyBonusClaimed && (
                      <span className="text-xs bg-green-500/20 border border-green-500/30 px-1 py-0.5 rounded text-green-400">
                        READY!
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{rewardsData.weeklyResetTime} left</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-blue-400">+1,000 XP</span>
                    <div className="text-xs text-gray-400">Progress: {rewardsData.weeklyProgress}/{rewardsData.weeklyTarget} XP</div>
                  </div>
                  <ClaimButton 
                    onClick={claimWeeklyBonus}
                    disabled={rewardsData.weeklyBonusClaimed || rewardsData.weeklyProgress < rewardsData.weeklyTarget}
                    variant="blue"
                  >
                    {rewardsData.weeklyBonusClaimed ? 'Claimed' : rewardsData.weeklyProgress >= rewardsData.weeklyTarget ? 'Claim' : 'Locked'}
                  </ClaimButton>
                </div>
              </div>

              {/* Monthly Bonus */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">Monthly Bonus</span>
                    {profileData.level >= 5 && !rewardsData.monthlyBonusClaimed && (
                      <span className="text-xs bg-green-500/20 border border-green-500/30 px-1 py-0.5 rounded text-green-400">
                        READY!
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{rewardsData.monthlyResetTime} left</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-purple-400">+2,000 XP</span>
                    <div className="text-xs text-gray-400">Requires: Level 5+</div>
                  </div>
                  <ClaimButton 
                    onClick={claimMonthlyBonus}
                    disabled={rewardsData.monthlyBonusClaimed || profileData.level < 5}
                    variant="purple"
                  >
                    {rewardsData.monthlyBonusClaimed ? 'Claimed' : profileData.level >= 5 ? 'Claim' : 'Locked'}
                  </ClaimButton>
                </div>
              </div>

              {/* Streak Multiplier Bonus */}
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-medium text-orange-400">Streak Bonus</span>
                  </div>
                  <span className="text-xs text-gray-400">{extendedStats.currentStreak}-day streak</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-orange-400">{rewardsData.streakMultiplier.toFixed(1)}x Multiplier</span>
                    <div className="text-xs text-gray-400">Affects daily bonus</div>
                  </div>
                  <div className="text-xs bg-orange-500/20 border border-orange-500/30 px-2 py-1 rounded text-orange-400">
                    {rewardsData.streakMultiplier > 1.0 ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Tier Progression & Rewards */}
          <div className="flex-1 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Crown className="h-6 w-6 mr-3 text-yellow-400" />
              Tier Progression
            </h3>

            {/* Major Tier Unlocks */}
            <div className="space-y-4 mb-8">
              {getMajorTierMilestones().map((milestone, index) => {
                const isGodlike = milestone.tier === 'Godlike'
                const isTranscendent = milestone.tier === 'Transcendent'
                const isLegendary = isGodlike || isTranscendent
                const isNext = index === 0
                
                return (
                  <div
                    key={milestone.level}
                    className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                      isNext
                        ? `bg-gradient-to-br ${milestone.bgColor}/20 border-white/40 shadow-2xl`
                        : isTranscendent
                        ? 'bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border-yellow-500/30 shadow-xl'
                        : isGodlike
                        ? 'bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-pink-500/10 border-pink-500/30 shadow-lg'
                        : milestone.tier === 'Mythic'
                        ? 'bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-purple-500/10 border-purple-500/20'
                        : milestone.tier === 'Legend'
                        ? 'bg-gradient-to-br from-red-500/10 via-orange-500/10 to-red-500/10 border-red-500/20'
                        : milestone.tier === 'Master'
                        ? 'bg-gradient-to-br from-orange-500/10 via-red-500/10 to-orange-500/10 border-orange-500/20'
                        : milestone.tier === 'Champion'
                        ? 'bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border-yellow-500/20'
                        : 'bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-500/10 border-green-500/20'
                    }`}
                  >
                    {/* Special effects for legendary tiers */}
                    {isTranscendent && (
                      <div className="absolute top-2 right-2 text-yellow-400">
                        <Crown className="h-4 w-4" />
                      </div>
                    )}
                    
                    {isGodlike && (
                      <div className="absolute top-2 right-2 text-pink-400">
                        <Crown className="h-4 w-4" />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${milestone.bgColor} rounded-xl flex items-center justify-center shadow-lg border-2 ${
                          isTranscendent ? 'border-yellow-400/40 shadow-yellow-500/20' :
                          isGodlike ? 'border-pink-400/40 shadow-pink-500/20' :
                          isNext ? 'border-white/30' : 'border-white/20'
                        } ${isLegendary ? 'animate-pulse' : ''}`}>
                          <HeroIcon level={milestone.level} className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className={`text-lg font-bold ${
                            isTranscendent ? 'text-yellow-400' :
                            isGodlike ? 'text-pink-400' :
                            milestone.tier === 'Mythic' ? 'text-purple-400' :
                            milestone.tier === 'Legend' ? 'text-red-400' :
                            milestone.tier === 'Master' ? 'text-orange-400' :
                            milestone.tier === 'Champion' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            Level {milestone.level} • {milestone.tier}
                            {isTranscendent && ' ✨'}
                            {isGodlike && ' 👑'}
                            {milestone.tier === 'Mythic' && ' 🔮'}
                            {milestone.tier === 'Legend' && ' ⚡'}
                          </div>
                          <div className={`text-sm ${
                            isNext ? (
                              isTranscendent ? 'text-yellow-300' :
                              isGodlike ? 'text-pink-300' :
                              milestone.color
                            ) : 'text-gray-500'
                          }`}>
                            {isNext ? 'Next Major Tier' : 
                             isTranscendent ? 'Ultimate Achievement' :
                             isGodlike ? 'Legendary Status' :
                             milestone.tier === 'Mythic' ? 'Epic Power' :
                             milestone.tier === 'Legend' ? 'Legendary Warrior' :
                             'Future Unlock'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          isNext ? (
                            isTranscendent ? 'text-yellow-400' :
                            isGodlike ? 'text-pink-400' :
                            'text-yellow-400'
                          ) : (
                            isTranscendent ? 'text-yellow-500' :
                            isGodlike ? 'text-pink-500' :
                            milestone.tier === 'Mythic' ? 'text-purple-500' :
                            milestone.tier === 'Legend' ? 'text-red-500' :
                            'text-gray-500'
                          )
                        }`}>
                          {milestone.xpNeeded > 0 ? `${milestone.xpNeeded.toLocaleString()} XP` : 'Unlocked'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {isNext ? 'to unlock' : 'required'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 