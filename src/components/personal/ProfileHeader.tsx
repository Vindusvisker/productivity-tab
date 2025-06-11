'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Zap, Crown, Shield, TrendingUp } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import HeroIcon from './HeroIcon'
import ProfileDialog from './ProfileDialog'

interface ProfileData {
  level: number
  currentXP: number
  totalXP: number
  title: string
  rank: string
  completedMissions: number
  daysActive: number
}

type DailyLog = {
  date: string
  habitsCompleted: number
  focusSessions: number
  snusCount: number
}

export default function ProfileHeader() {
  const [profile, setProfile] = useState<ProfileData>({
    level: 1,
    currentXP: 0,
    totalXP: 0,
    title: 'Novice Achiever',
    rank: 'Bronze',
    completedMissions: 0,
    daysActive: 0
  })
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [extendedProfileData, setExtendedProfileData] = useState({
    dailyXP: 0,
    dailyBonusXP: 0,
    weeklyBonusXP: 0,
    monthlyBonusXP: 0,
    streakXP: 0,
    missionXP: 0,
    achievementXP: 0
  })

  useEffect(() => {
    loadProfileData()
    
    // Listen for daily logs updates from JourneyHeatmap
    const handleDailyLogsUpdate = () => {
      loadProfileData()
    }
    
    // Listen for mission completion from ActiveMissions
    const handleMissionCompleted = () => {
      loadProfileData()
    }
    
    // Listen for achievement unlocks from AchievementWall
    const handleAchievementUnlocked = () => {
      loadProfileData()
    }
    
    window.addEventListener('dailyLogsUpdated', handleDailyLogsUpdate)
    window.addEventListener('missionCompleted', handleMissionCompleted)
    window.addEventListener('achievementUnlocked', handleAchievementUnlocked)
    
    return () => {
      window.removeEventListener('dailyLogsUpdated', handleDailyLogsUpdate)
      window.removeEventListener('missionCompleted', handleMissionCompleted)
      window.removeEventListener('achievementUnlocked', handleAchievementUnlocked)
    }
  }, [])

  const loadProfileData = async () => {
    try {
      // Load daily logs from JourneyHeatmap
      const dailyLogs = await storage.load('daily-logs') || {}
      
      // Load current streaks for bonus XP
      const habitStreak = await storage.load('habit-streak') || 0
      const snusData = await storage.load('snus-data') || { currentStreak: 0 }
      
      // Calculate XP from all daily logs (includes backfilled data)
      let totalDailyXP = 0
      Object.values(dailyLogs as Record<string, DailyLog>).forEach((log: DailyLog) => {
        // Daily activity XP: habits worth 50 each, focus worth 25 each, snus penalty -10 each
        const dailyXP = (log.habitsCompleted * 50) + (log.focusSessions * 25) - (log.snusCount * 10)
        totalDailyXP += Math.max(0, dailyXP) // Don't go negative per day
      })
      
      // Add streak bonuses (encourages consistency)
      const streakBonusXP = (habitStreak * 100) + (snusData.currentStreak * 150)
      
      // Add mission XP (from completed missions)
      const missionXP = await storage.load('mission-xp') || 0
      
      // Add achievement XP (from unlocked achievements)
      const achievementXP = await storage.load('achievement-xp') || 0
      
      // Add daily bonus XP (from ProfileDialog daily bonus claims)
      const dailyBonusXP = await storage.load('daily-activity-xp') || 0
      
      // Add weekly bonus XP (from ProfileDialog weekly bonus claims)
      const weeklyBonusXP = await storage.load('weekly-bonus-xp') || 0
      
      // Add monthly bonus XP (from ProfileDialog monthly bonus claims)
      const monthlyBonusXP = await storage.load('monthly-bonus-xp') || 0
      
      // Store XP breakdown for dialog
      setExtendedProfileData({
        dailyXP: totalDailyXP, // Keep daily activity separate
        dailyBonusXP: dailyBonusXP, // Track daily bonuses separately
        weeklyBonusXP: weeklyBonusXP, // Track weekly bonuses separately
        monthlyBonusXP: monthlyBonusXP, // Track monthly bonuses separately
        streakXP: streakBonusXP,
        missionXP: missionXP,
        achievementXP: achievementXP
      })
      
      // Load completed missions count
      const completedMissionsArray = await storage.load('completed-missions') || []
      const completedMissions = completedMissionsArray.length
      
      // Load completed achievements count
      const unlockedAchievements = await storage.load('unlocked-achievements') || []
      const completedAchievements = unlockedAchievements.length
      
      // Total completions = missions + achievements
      const totalCompletions = completedMissions + completedAchievements
      
      // Total XP = daily activity + daily bonuses + weekly bonuses + monthly bonuses + streak bonuses + mission rewards + achievement rewards
      const totalXP = totalDailyXP + dailyBonusXP + weeklyBonusXP + monthlyBonusXP + streakBonusXP + missionXP + achievementXP
      const level = Math.floor(totalXP / 1000) + 1
      const currentXP = totalXP % 1000
      
      // Determine title based on performance
      const title = getTitleForLevel(level)
      const rank = getRankForLevel(level)
      
      // Calculate daysActive
      const daysActive = Object.keys(dailyLogs).length
      
      setProfile({
        level,
        currentXP,
        totalXP,
        title,
        rank,
        completedMissions: totalCompletions, // Now includes both missions and achievements
        daysActive
      })
    } catch (error) {
      console.error('Error loading profile data:', error)
    }
  }

  const getTitleForLevel = (level: number): string => {
    if (level >= 20) return 'Productivity Legend'
    if (level >= 15) return 'Habit Virtuoso'
    if (level >= 10) return 'Focus Master'
    if (level >= 5) return 'Rising Champion'
    return 'Novice Achiever'
  }

  const getRankForLevel = (level: number): string => {
    if (level >= 20) return 'Platinum'
    if (level >= 10) return 'Gold'
    if (level >= 5) return 'Silver'
    return 'Bronze'
  }

  const getNextLevelXP = () => 1000
  const getXPProgress = () => (profile.currentXP / getNextLevelXP()) * 100

  const getRankIcon = () => {
    switch (profile.rank) {
      case 'Platinum': return <Crown className="h-4 w-4 text-purple-300" />
      case 'Gold': return <Crown className="h-4 w-4 text-yellow-300" />
      case 'Silver': return <Shield className="h-4 w-4 text-gray-300" />
      default: return <Shield className="h-4 w-4 text-orange-300" />
    }
  }

  const getRankColor = () => {
    switch (profile.rank) {
      case 'Platinum': return 'from-purple-400 via-purple-500 to-indigo-600'
      case 'Gold': return 'from-yellow-400 via-orange-400 to-orange-600'
      case 'Silver': return 'from-gray-300 via-gray-400 to-gray-600'
      default: return 'from-orange-400 via-red-500 to-red-600'
    }
  }

  const getRankGlow = () => {
    switch (profile.rank) {
      case 'Platinum': return 'shadow-purple-500/50'
      case 'Gold': return 'shadow-yellow-500/50'
      case 'Silver': return 'shadow-gray-400/50'
      default: return 'shadow-orange-500/50'
    }
  }

  return (
    <>
      <Card 
        className="bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden relative cursor-pointer hover:border-white/20 hover:shadow-3xl transition-all duration-300 group"
        onClick={() => setDialogOpen(true)}
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-3xl group-hover:from-purple-500/10 group-hover:via-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300" />
        
        <CardContent className="p-6 relative">
          {/* Level indicator - top right */}
          <div className="absolute top-4 right-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300">
              LVL {profile.level}
            </div>
          </div>

          {/* Top Section - Avatar + Basic Info */}
          <div className="flex items-center space-x-4 mb-4">
            {/* Compact Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-16 h-16 bg-gradient-to-br ${getRankColor()} rounded-full flex items-center justify-center shadow-xl ${getRankGlow()} border-2 border-white/20 relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                {/* Inner shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent rounded-full" />
                <HeroIcon level={profile.level} className="h-8 w-8 text-white" />
              </div>
              
              {/* Rank badge */}
              <div className="absolute -top-1 -right-1 bg-black/90 backdrop-blur-sm rounded-full p-1 border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                {getRankIcon()}
              </div>
            </div>

            {/* Name & Title Section */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-white drop-shadow-sm truncate group-hover:text-blue-300 transition-colors duration-300">
                {profile.rank} Warrior
              </h1>
              <p className="text-sm text-gray-300 font-medium truncate">{profile.title}</p>
              
              {/* Stats row */}
              <div className="flex items-center space-x-3 pt-1">
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Zap className="h-3 w-3" />
                  <span className="text-xs font-semibold">{profile.totalXP.toLocaleString()}</span>
                  <span className="text-xs text-gray-400">XP</span>
                </div>
                <div className="w-1 h-1 bg-gray-500 rounded-full" />
                <div className="flex items-center space-x-1 text-purple-400">
                  <Star className="h-3 w-3" />
                  <span className="text-xs font-semibold">{profile.rank}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-3">
            {/* Progress header */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400 font-medium">Progress to Level {profile.level + 1}</span>
                <span className="text-xs text-blue-400 font-bold">
                  {profile.currentXP} / {getNextLevelXP()} XP
                </span>
              </div>
              
              {/* Enhanced XP Progress Bar */}
              <div className="w-full bg-gray-800/60 rounded-full h-3 relative overflow-hidden border border-white/10 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-white/60 via-white/80 to-white/60 h-full rounded-full transition-all duration-1000 relative shadow-lg"
                  style={{ width: `${getXPProgress()}%` }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
                
                {/* Progress Glow Effect */}
                {getXPProgress() > 0 && (
                  <div
                    className="absolute top-0 left-0 h-3 rounded-full blur-sm opacity-50"
                    style={{
                      width: `${getXPProgress()}%`,
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.8), rgba(255,255,255,0.6))'
                    }}
                  />
                )}
              </div>
              
              <p className="text-xs text-gray-400 mt-1 font-medium">
                {(getNextLevelXP() - profile.currentXP).toLocaleString()} XP until next level
              </p>
            </div>

            {/* Compact Quick Stats */}
            <div className="flex space-x-2">
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl px-3 py-2 text-center backdrop-blur-sm flex-1 group-hover:border-green-500/30 transition-colors duration-300">
                <div className="flex items-center justify-center space-x-1 mb-0.5">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <div className="text-sm font-bold text-green-400">{profile.completedMissions}</div>
                </div>
                <div className="text-xs text-gray-400 font-medium">Completed</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl px-3 py-2 text-center backdrop-blur-sm flex-1 group-hover:border-orange-500/30 transition-colors duration-300">
                <div className="flex items-center justify-center space-x-1 mb-0.5">
                  <Star className="h-3 w-3 text-orange-400" />
                  <div className="text-sm font-bold text-orange-400">{profile.daysActive}</div>
                </div>
                <div className="text-xs text-gray-400 font-medium">Days Active</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfileDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        profileData={{
          ...profile,
          ...extendedProfileData
        }}
      />
    </>
  )
}