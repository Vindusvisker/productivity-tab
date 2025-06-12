'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Clock, Target, Flame, Zap, Lock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import MissionDialog from './MissionDialog'
import { UserConfig } from '../../types/UserConfig'

type DailyLog = {
  date: string
  habitsCompleted: number
  focusSessions: number
  snusCount: number
}

interface Achievement {
  id: string
  title: string
  icon: string
  description: string
  category: 'habit' | 'focus' | 'snus' | 'streak' | 'wildcard'
  unlocked: boolean
  dateUnlocked?: string
  progress?: string
  xpReward: number
}

interface BadgeCardProps {
  achievement: Achievement
  onClick: () => void
}

interface BadgeCategoryProps {
  title: string
  icon: any
  achievements: Achievement[]
  onBadgeClick: (achievement: Achievement) => void
}

const BadgeCard = ({ achievement, onClick }: BadgeCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer hover:scale-105 ${
        achievement.unlocked
          ? 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/30 hover:border-purple-500/50'
          : 'bg-black/20 border-white/10 hover:border-white/20'
      }`}
    >
      {/* Badge Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${
        achievement.unlocked
          ? 'bg-gradient-to-br from-purple-400 to-indigo-500 shadow-lg'
          : 'bg-gray-700 opacity-50'
      }`}>
        {achievement.unlocked ? achievement.icon : <Lock className="h-6 w-6 text-gray-400" />}
      </div>

      {/* Badge Info */}
      <div className="space-y-2">
        <h3 className={`font-semibold text-sm ${
          achievement.unlocked ? 'text-white' : 'text-gray-400'
        }`}>
          {achievement.title}
        </h3>
        
        <p className="text-xs text-gray-400 leading-relaxed">
          {achievement.description}
        </p>

        {/* Status */}
        {achievement.unlocked ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-green-400">
              <CheckCircle className="h-3 w-3" />
              <span className="text-xs">Unlocked</span>
            </div>
            <div className="flex items-center space-x-1 text-yellow-400">
              <Zap className="h-3 w-3" />
              <span className="text-xs">+{achievement.xpReward}</span>
            </div>
          </div>
        ) : achievement.progress ? (
          <div className="text-xs text-blue-400 font-medium">
            {achievement.progress}
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            Locked
          </div>
        )}
      </div>

      {/* Unlock glow effect */}
      {achievement.unlocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </div>
  )
}

const BadgeCategory = ({ title, icon: Icon, achievements, onBadgeClick }: BadgeCategoryProps) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Icon className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
        <Badge variant="secondary" className="bg-white/10 text-gray-300">
          {unlockedCount}/{totalCount}
        </Badge>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <BadgeCard
            key={achievement.id}
            achievement={achievement}
            onClick={() => onBadgeClick(achievement)}
          />
        ))}
      </div>
    </div>
  )
}

export default function AchievementWall({ userConfig }: { userConfig?: UserConfig | null }) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const ACHIEVEMENTS_PER_PAGE = 6
  const TOTAL_PAGES = 5

  useEffect(() => {
    loadAchievements()
    
    // Listen for data updates
    const handleDataUpdate = () => {
      loadAchievements()
    }
    
    window.addEventListener('dailyLogsUpdated', handleDataUpdate)
    window.addEventListener('missionCompleted', handleDataUpdate)
    
    return () => {
      window.removeEventListener('dailyLogsUpdated', handleDataUpdate)
      window.removeEventListener('missionCompleted', handleDataUpdate)
    }
  }, [])

  const loadAchievements = async () => {
    try {
      // Load all data sources
      const dailyLogs = await storage.load('daily-logs') || {}
      const logs = Object.values(dailyLogs as Record<string, DailyLog>)
      const completedMissions = await storage.load('completed-missions') || []
      const habitStreak = await storage.load('habit-streak') || 0
      
      // Calculate stats
      const totalHabits = logs.reduce((sum, log) => sum + log.habitsCompleted, 0)
      const totalFocus = logs.reduce((sum, log) => sum + log.focusSessions, 0)
      const cleanDays = logs.filter(log => log.snusCount === 0).length
      const currentStreak = calculateCurrentStreak(logs)
      const focusHours = Math.floor(totalFocus * 0.42) // 25min sessions
      
      // Helper to get dynamic habit name
      const getHabitName = () => {
        if (!userConfig) return 'Habit'
        if (userConfig.addictionName && userConfig.addictionName.trim()) {
          return userConfig.addictionName
        }
        switch (userConfig.addictionType) {
          case 'snus': return 'Snus'
          case 'tobacco': return 'Cigarette'
          case 'alcohol': return 'Drink'
          case 'gambling': return 'Gambling'
          case 'other': return 'Habit'
          default: return 'Habit'
        }
      }
      // Helper to get dynamic icon
      const getHabitIcon = () => {
        if (!userConfig) return '🚭'
        switch (userConfig.addictionType) {
          case 'snus': return '🚭'
          case 'tobacco': return '🚬'
          case 'alcohol': return '🍺'
          case 'gambling': return '🎰'
          case 'other': return '🎯'
          default: return '🚭'
        }
      }
      
      // Define ALL achievements across 5 pages
      const allAchievements: Omit<Achievement, 'unlocked' | 'dateUnlocked' | 'progress'>[] = [
        // Page 1: Starter Achievements
        { id: 'starter-spark', title: 'Starter Spark', icon: '⚡', description: 'Complete 5 habits total', category: 'habit', xpReward: 100 },
        { id: 'flow-initiate', title: 'Flow Initiate', icon: '🧘‍♂️', description: 'Log 5 deep work sessions', category: 'focus', xpReward: 100 },
        { id: 'clean-day', title: `Clean ${getHabitName()} Day`, icon: getHabitIcon(), description: `Take 0 ${getHabitName().toLowerCase()} in a day`, category: 'habit', xpReward: 200 },
        { id: 'first-score', title: 'First Score', icon: '🎯', description: 'Achieve a daily score of 3+', category: 'wildcard', xpReward: 150 },
        { id: 'habit-duo', title: 'Habit Duo', icon: '👥', description: 'Complete 2 habits in one day', category: 'habit', xpReward: 75 },
        { id: 'focus-rookie', title: 'Focus Rookie', icon: '🎓', description: 'Complete your first focus session', category: 'focus', xpReward: 50 },

        // Page 2: Building Momentum
        { id: 'habit-trio', title: 'Habit Trio', icon: '🔥', description: 'Complete 3 habits in one day', category: 'habit', xpReward: 200 },
        { id: 'focus-flow', title: 'Focus Flow', icon: '🌊', description: 'Complete 3 focus sessions in one day', category: 'focus', xpReward: 250 },
        { id: 'clean-streak-3', title: 'Clean Trio', icon: '🌈', description: '3 clean days in a row', category: 'snus', xpReward: 300 },
        { id: 'week-warrior', title: 'Week Warrior', icon: '⚔️', description: '7-day habit streak', category: 'streak', xpReward: 400 },
        { id: 'focus-champion', title: 'Focus Champion', icon: '🏆', description: 'Complete 10 focus sessions total', category: 'focus', xpReward: 300 },
        { id: 'habit-machine', title: 'Habit Machine', icon: '🤖', description: 'Complete 20 habits total', category: 'habit', xpReward: 250 },

        // Page 3: Serious Progress
        { id: 'mission-master', title: 'Mission Master', icon: '🏆', description: 'Complete 3 weekly missions', category: 'wildcard', xpReward: 400 },
        { id: 'habit-fifty', title: 'Half Century', icon: '🎯', description: 'Complete 50 habits total', category: 'habit', xpReward: 500 },
        { id: 'focus-marathon', title: 'Focus Marathon', icon: '🏃‍♂️', description: 'Complete 25 focus sessions total', category: 'focus', xpReward: 450 },
        { id: 'clean-week', title: 'Clean Week', icon: '✨', description: '7 clean days in a week', category: 'snus', xpReward: 600 },
        { id: 'perfectionist', title: 'Perfectionist', icon: '💎', description: 'Score 10+ on a single day', category: 'wildcard', xpReward: 400 },
        { id: 'two-week-king', title: 'Two Week King', icon: '👑', description: '14-day habit streak', category: 'streak', xpReward: 700 },

        // Page 4: Advanced Mastery
        { id: 'habit-century', title: 'Centurion', icon: '💯', description: 'Complete 100 habits total', category: 'habit', xpReward: 750 },
        { id: 'focus-master', title: 'Focus Master', icon: '🧠', description: 'Complete 50 focus sessions total', category: 'focus', xpReward: 600 },
        { id: 'clean-month', title: 'Clean Month', icon: '🗓️', description: '30 clean days total', category: 'snus', xpReward: 1000 },
        { id: 'streak-lord', title: 'Streak Lord', icon: '👑', description: '30-day habit streak', category: 'streak', xpReward: 1000 },
        { id: 'power-user', title: 'Power User', icon: '⚡', description: 'Score 15+ on a single day', category: 'wildcard', xpReward: 600 },
        { id: 'mission-legend', title: 'Mission Legend', icon: '🏅', description: 'Complete 10 weekly missions', category: 'wildcard', xpReward: 800 },

        // Page 5: Legendary Status
        { id: 'habit-legend', title: 'Habit Legend', icon: '🦄', description: 'Complete 200 habits total', category: 'habit', xpReward: 1200 },
        { id: 'focus-god', title: 'Focus God', icon: '⭐', description: 'Complete 100 focus sessions total', category: 'focus', xpReward: 1000 },
        { id: 'snus-slayer', title: 'Snus Slayer', icon: '🗡️', description: '90 clean days total', category: 'snus', xpReward: 1500 },
        { id: 'immortal-streak', title: 'Immortal', icon: '👼', description: '100-day habit streak', category: 'streak', xpReward: 2000 },
        { id: 'daily-dominator', title: 'Daily Dominator', icon: '🌟', description: 'Score 20+ on a single day', category: 'wildcard', xpReward: 1000 },
        { id: 'ultimate-master', title: 'Ultimate Master', icon: '🎭', description: 'Complete 25 weekly missions', category: 'wildcard', xpReward: 1500 },
      ]
      
      // Check unlock status for each achievement
      const processedAchievements: Achievement[] = allAchievements.map(achievement => {
        let unlocked = false
        let progress = ''
        
        switch (achievement.id) {
          // Page 1 - Starters
          case 'starter-spark':
            unlocked = totalHabits >= 5
            progress = unlocked ? '' : `${totalHabits}/5`
            break
          case 'flow-initiate':
            unlocked = totalFocus >= 5
            progress = unlocked ? '' : `${totalFocus}/5`
            break
          case 'clean-day':
            unlocked = cleanDays >= 1
            progress = unlocked ? '' : `${cleanDays}/1`
            break
          case 'first-score':
            unlocked = logs.some(log => (log.habitsCompleted * 2 + log.focusSessions * 1 - log.snusCount * 1) >= 3)
            progress = unlocked ? '' : 'Score 3+ points'
            break
          case 'habit-duo':
            unlocked = logs.some(log => log.habitsCompleted >= 2)
            progress = unlocked ? '' : 'Complete 2 habits/day'
            break
          case 'focus-rookie':
            unlocked = totalFocus >= 1
            progress = unlocked ? '' : `${totalFocus}/1`
            break

          // Page 2 - Building
          case 'habit-trio':
            unlocked = logs.some(log => log.habitsCompleted >= 3)
            progress = unlocked ? '' : 'Complete 3 habits/day'
            break
          case 'focus-flow':
            unlocked = logs.some(log => log.focusSessions >= 3)
            progress = unlocked ? '' : 'Complete 3 sessions/day'
            break
          case 'clean-streak-3':
            unlocked = checkConsecutiveCleanDays(logs, 3)
            progress = unlocked ? '' : '3 clean days in a row'
            break
          case 'week-warrior':
            unlocked = currentStreak >= 7
            progress = unlocked ? '' : `${currentStreak}/7`
            break
          case 'focus-champion':
            unlocked = totalFocus >= 10
            progress = unlocked ? '' : `${totalFocus}/10`
            break
          case 'habit-machine':
            unlocked = totalHabits >= 20
            progress = unlocked ? '' : `${totalHabits}/20`
            break

          // Page 3 - Serious
          case 'mission-master':
            unlocked = completedMissions.length >= 3
            progress = unlocked ? '' : `${completedMissions.length}/3`
            break
          case 'habit-fifty':
            unlocked = totalHabits >= 50
            progress = unlocked ? '' : `${totalHabits}/50`
            break
          case 'focus-marathon':
            unlocked = totalFocus >= 25
            progress = unlocked ? '' : `${totalFocus}/25`
            break
          case 'clean-week':
            unlocked = checkWeeklyCleanDays(logs, 7)
            progress = unlocked ? '' : '7 clean days in week'
            break
          case 'perfectionist':
            unlocked = checkPerfectDay(logs)
            progress = unlocked ? '' : 'Score 10+ in one day'
            break
          case 'two-week-king':
            unlocked = currentStreak >= 14
            progress = unlocked ? '' : `${currentStreak}/14`
            break

          // Page 4 - Advanced
          case 'habit-century':
            unlocked = totalHabits >= 100
            progress = unlocked ? '' : `${totalHabits}/100`
            break
          case 'focus-master':
            unlocked = totalFocus >= 50
            progress = unlocked ? '' : `${totalFocus}/50`
            break
          case 'clean-month':
            unlocked = cleanDays >= 30
            progress = unlocked ? '' : `${cleanDays}/30`
            break
          case 'streak-lord':
            unlocked = currentStreak >= 30
            progress = unlocked ? '' : `${currentStreak}/30`
            break
          case 'power-user':
            unlocked = logs.some(log => (log.habitsCompleted * 2 + log.focusSessions * 1 - log.snusCount * 1) >= 15)
            progress = unlocked ? '' : 'Score 15+ in one day'
            break
          case 'mission-legend':
            unlocked = completedMissions.length >= 10
            progress = unlocked ? '' : `${completedMissions.length}/10`
            break

          // Page 5 - Legendary
          case 'habit-legend':
            unlocked = totalHabits >= 200
            progress = unlocked ? '' : `${totalHabits}/200`
            break
          case 'focus-god':
            unlocked = totalFocus >= 100
            progress = unlocked ? '' : `${totalFocus}/100`
            break
          case 'snus-slayer':
            unlocked = cleanDays >= 90
            progress = unlocked ? '' : `${cleanDays}/90`
            break
          case 'immortal-streak':
            unlocked = currentStreak >= 100
            progress = unlocked ? '' : `${currentStreak}/100`
            break
          case 'daily-dominator':
            unlocked = logs.some(log => (log.habitsCompleted * 2 + log.focusSessions * 1 - log.snusCount * 1) >= 20)
            progress = unlocked ? '' : 'Score 20+ in one day'
            break
          case 'ultimate-master':
            unlocked = completedMissions.length >= 25
            progress = unlocked ? '' : `${completedMissions.length}/25`
            break
        }
        
        return {
          ...achievement,
          unlocked,
          progress: unlocked ? undefined : progress,
          dateUnlocked: unlocked ? new Date().toISOString().split('T')[0] : undefined
        }
      })
      
      // Check for newly unlocked achievements and award XP
      await checkAndAwardAchievementXP(processedAchievements)
      
      setAchievements(processedAchievements)
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAndAwardAchievementXP = async (achievements: Achievement[]) => {
    try {
      // Load previously unlocked achievements
      const unlockedAchievements = await storage.load('unlocked-achievements') || []
      const newlyUnlocked: string[] = []
      let totalAwardedXP = 0

      for (const achievement of achievements) {
        const isAlreadyUnlocked = unlockedAchievements.includes(achievement.id)
        const isJustUnlocked = achievement.unlocked && !isAlreadyUnlocked

        if (isJustUnlocked) {
          newlyUnlocked.push(achievement.id)
          totalAwardedXP += achievement.xpReward
          console.log(`🎉 Achievement unlocked: ${achievement.title} (+${achievement.xpReward} XP)`)
        }
      }

      if (newlyUnlocked.length > 0) {
        // Save newly unlocked achievements
        const updatedUnlocked = [...unlockedAchievements, ...newlyUnlocked]
        await storage.save('unlocked-achievements', updatedUnlocked)
        
        // Add achievement XP to storage
        const currentAchievementXP = await storage.load('achievement-xp') || 0
        await storage.save('achievement-xp', currentAchievementXP + totalAwardedXP)
        
        // Trigger ProfileHeader update
        window.dispatchEvent(new CustomEvent('achievementUnlocked', {
          detail: { newAchievements: newlyUnlocked, xpAwarded: totalAwardedXP }
        }))
      }
    } catch (error) {
      console.error('Error checking achievement XP:', error)
    }
  }

  const calculateCurrentStreak = (logs: DailyLog[]): number => {
    if (logs.length === 0) return 0
    
    const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const getScore = (log: DailyLog) => log.habitsCompleted * 2 + log.focusSessions * 1 - log.snusCount * 1
    
    const today = new Date().toISOString().split('T')[0]
    
    let streak = 0
    for (const log of sortedLogs) {
      const score = getScore(log)
      const isToday = log.date === today
      
      // Skip today if it has a low score (day might not be complete)
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

  const checkConsecutiveCleanDays = (logs: DailyLog[], target: number): boolean => {
    const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let consecutive = 0
    let maxConsecutive = 0
    
    for (const log of sortedLogs) {
      if (log.snusCount === 0) {
        consecutive++
        maxConsecutive = Math.max(maxConsecutive, consecutive)
      } else {
        consecutive = 0
      }
    }
    
    return maxConsecutive >= target
  }

  const checkWeeklyCleanDays = (logs: DailyLog[], target: number): boolean => {
    return logs.filter(log => log.snusCount === 0).length >= target
  }

  const checkPerfectDay = (logs: DailyLog[]): boolean => {
    return logs.some(log => {
      const score = log.habitsCompleted * 2 + log.focusSessions * 1 - log.snusCount * 1
      return score >= 10
    })
  }

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement)
    setDialogOpen(true)
  }

  const getCurrentPageAchievements = () => {
    const startIndex = currentPage * ACHIEVEMENTS_PER_PAGE
    const endIndex = startIndex + ACHIEVEMENTS_PER_PAGE
    return achievements.slice(startIndex, endIndex)
  }

  const getPageTitle = (page: number) => {
    const titles = [
      'Starter Achievements',
      'Building Momentum', 
      'Serious Progress',
      'Advanced Mastery',
      'Legendary Status'
    ]
    return titles[page] || 'Achievements'
  }

  const canNavigatePrev = () => currentPage > 0
  const canNavigateNext = () => currentPage < TOTAL_PAGES - 1

  const currentPageAchievements = getCurrentPageAchievements()
  const unlockedCount = currentPageAchievements.filter(a => a.unlocked).length
  const totalCount = currentPageAchievements.length

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-black/70 to-black/60 backdrop-blur-xl border border-white/10 h-full">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <div className="text-gray-400">Loading achievements...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={`bg-gradient-to-br from-black/70 to-black/60 backdrop-blur-xl border border-white/10 h-full flex flex-col rounded-3xl`}>
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span>Achievement Wall</span>
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{getPageTitle(currentPage)} - {unlockedCount}/{totalCount} unlocked</p>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={!canNavigatePrev()}
                className="text-gray-400 hover:text-white disabled:opacity-30 h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-xs text-gray-500 px-2">
                {currentPage + 1}/{TOTAL_PAGES}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(TOTAL_PAGES - 1, prev + 1))}
                disabled={!canNavigateNext()}
                className="text-gray-400 hover:text-white disabled:opacity-30 h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 flex-1 flex flex-col">
          {/* Achievement Grid - Compact 2x3 */}
          <div className="flex-1 flex items-center justify-center mb-4">
            <div className="grid grid-cols-2 gap-3 w-full">
              {currentPageAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  onClick={() => handleAchievementClick(achievement)}
                  className={`relative p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-105 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/30 hover:border-purple-500/50'
                      : 'bg-black/20 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Badge Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg mb-2 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-purple-400 to-indigo-500 shadow-lg'
                      : 'bg-gray-700 opacity-50'
                  }`}>
                    {achievement.unlocked ? achievement.icon : <Lock className="h-4 w-4 text-gray-400" />}
                  </div>

                  {/* Badge Info */}
                  <div className="space-y-1">
                    <h3 className={`font-semibold text-xs ${
                      achievement.unlocked ? 'text-white' : 'text-gray-400'
                    }`}>
                      {achievement.title}
                    </h3>
                    
                    {/* Status */}
                    {achievement.unlocked ? (
                      <div className="flex items-center space-x-1 text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-xs">+{achievement.xpReward} XP</span>
                      </div>
                    ) : achievement.progress ? (
                      <div className="text-xs text-blue-400 font-medium">
                        {achievement.progress}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Locked
                      </div>
                    )}
                  </div>

                  {/* Unlock glow effect */}
                  {achievement.unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats - Bottom summary */}
          <div className="pt-4 border-t border-white/10 flex-shrink-0">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-purple-400">
                  {achievements.filter(a => a.unlocked).length}
                </div>
                <div className="text-xs text-gray-400">Total Unlocked</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">
                  {achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0)}
                </div>
                <div className="text-xs text-gray-400">Total XP</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-400">
                  {Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%
                </div>
                <div className="text-xs text-gray-400">Overall Progress</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MissionDialog
        achievement={selectedAchievement}
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setSelectedAchievement(null)
        }}
      />
    </>
  )
} 