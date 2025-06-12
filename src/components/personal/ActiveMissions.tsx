'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Target, Flame, Trophy, ArrowRight, Zap, Brain, Star, Calendar } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import { UserConfig } from '../../types/UserConfig'

type DailyLog = {
  date: string
  habitsCompleted: number
  focusSessions: number
  snusCount: number
}

interface Mission {
  id: string
  title: string
  description: string
  progress: number
  target: number
  xpReward: number
  type: 'weekly' | 'milestone'
  icon: string
  color: string
}

interface WeeklyMissionTemplate {
  id: string
  title: string
  description: string
  target: number
  xpReward: number
  icon: string
  color: string
  calculateProgress: (logs: DailyLog[]) => number
}

export default function ActiveMissions({ userConfig }: { userConfig?: UserConfig | null }) {
  const [missions, setMissions] = useState<Mission[]>([])
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadMissions()
    
    // Listen for daily logs updates from JourneyHeatmap
    const handleDailyLogsUpdate = () => {
      loadMissions()
    }
    
    window.addEventListener('dailyLogsUpdated', handleDailyLogsUpdate)
    
    return () => {
      window.removeEventListener('dailyLogsUpdated', handleDailyLogsUpdate)
    }
  }, [])

  const loadMissions = async () => {
    try {
      // Load daily logs from JourneyHeatmap (main data source)
      const dailyLogs = await storage.load('daily-logs') || {}
      const logs = Object.values(dailyLogs as Record<string, DailyLog>)
      
      // Load completed missions
      const completed = await storage.load('completed-missions') || []
      setCompletedMissions(new Set(completed))
      
      // Get current week's data
      const weekLogs = getCurrentWeekLogs(logs)
      
      // Get weekly mission for this week
      const weeklyMission = getWeeklyMission(weekLogs)
      
      // Get next milestone based on current progress
      const milestoneMission = getNextMilestone(logs)
      
      const activeMissions: Mission[] = milestoneMission 
        ? [weeklyMission, milestoneMission] 
        : [weeklyMission]

      // Check for newly completed missions and award XP
      await checkAndAwardCompletedMissions(activeMissions, completed)

      setMissions(activeMissions)
    } catch (error) {
      console.error('Error loading missions:', error)
    }
  }

  const checkAndAwardCompletedMissions = async (missions: Mission[], alreadyCompleted: string[]) => {
    const newlyCompleted: string[] = []
    let totalAwardedXP = 0

    for (const mission of missions) {
      const missionId = getMissionId(mission)
      const isAlreadyCompleted = alreadyCompleted.includes(missionId)
      const isJustCompleted = mission.progress >= mission.target

      if (isJustCompleted && !isAlreadyCompleted) {
        newlyCompleted.push(missionId)
        totalAwardedXP += mission.xpReward
        console.log(`🎉 Mission completed: ${mission.title} (+${mission.xpReward} XP)`)
      }
    }

    if (newlyCompleted.length > 0) {
      // Save newly completed missions
      const updatedCompleted = [...alreadyCompleted, ...newlyCompleted]
      await storage.save('completed-missions', updatedCompleted)
      
      // Add mission XP to storage
      const currentMissionXP = await storage.load('mission-xp') || 0
      await storage.save('mission-xp', currentMissionXP + totalAwardedXP)
      
      // Trigger ProfileHeader update
      window.dispatchEvent(new CustomEvent('missionCompleted'))
      
      setCompletedMissions(new Set(updatedCompleted))
    }
  }

  const getMissionId = (mission: Mission): string => {
    // Create unique ID based on mission type and week/milestone
    if (mission.type === 'weekly') {
      const weekNumber = getWeekNumber()
      return `weekly-${mission.id}-week-${weekNumber}`
    } else {
      return `milestone-${mission.id}-target-${mission.target}`
    }
  }

  const getCurrentWeekLogs = (logs: DailyLog[]): DailyLog[] => {
    const today = new Date()
    const startOfWeek = new Date(today)
    
    // Start week on Monday instead of Sunday
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // If Sunday, go back 6 days to Monday
    startOfWeek.setDate(today.getDate() - daysFromMonday)
    startOfWeek.setHours(0, 0, 0, 0) // Start of day
    
    const endOfWeek = new Date(today)
    endOfWeek.setHours(23, 59, 59, 999) // End of today
    
    const weekLogs = logs.filter(log => {
      const logDate = new Date(log.date)
      logDate.setHours(12, 0, 0, 0) // Normalize to noon to avoid timezone issues
      return logDate >= startOfWeek && logDate <= endOfWeek
    })
    
    return weekLogs
  }

  const getWeekNumber = (): number => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - start.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 7))
  }

  const getWeeklyMissionTemplates = (): WeeklyMissionTemplate[] => {
    return [
      {
        id: 'habit-domination',
        title: 'Weekly Domination',
        description: 'Complete 35 habits this week',
        target: 35,
        xpReward: 500,
        icon: '🎯',
        color: 'from-purple-500 to-pink-500',
        calculateProgress: (logs) => logs.reduce((sum, log) => sum + log.habitsCompleted, 0)
      },
      {
        id: 'focus-mastery',
        title: 'Focus Mastery',
        description: 'Complete 20 focus sessions this week',
        target: 20,
        xpReward: 450,
        icon: '🧠',
        color: 'from-blue-500 to-cyan-500',
        calculateProgress: (logs) => logs.reduce((sum, log) => sum + log.focusSessions, 0)
      },
      {
        id: 'clean-week',
        title: `Clean Week Challenge`,
        description: `Have 0 ${getHabitName().toLowerCase()} for 5 days this week`,
        target: 5,
        xpReward: 600,
        icon: getHabitIcon(),
        color: 'from-green-500 to-emerald-500',
        calculateProgress: (logs) => logs.filter(log => log.snusCount === 0).length
      },
      {
        id: 'consistency-king',
        title: 'Consistency King',
        description: 'Have 6 days with score ≥ 3 this week',
        target: 6,
        xpReward: 550,
        icon: '👑',
        color: 'from-yellow-500 to-orange-500',
        calculateProgress: (logs) => logs.filter(log => 
          (log.habitsCompleted * 2 + log.focusSessions * 1 - log.snusCount * 1) >= 3
        ).length
      },
      {
        id: 'habit-focus-combo',
        title: 'Perfect Balance',
        description: 'Complete 25 habits + 15 focus sessions',
        target: 40, // Combined target
        xpReward: 525,
        icon: '⚖️',
        color: 'from-indigo-500 to-purple-500',
        calculateProgress: (logs) => {
          const habits = logs.reduce((sum, log) => sum + log.habitsCompleted, 0)
          const focus = logs.reduce((sum, log) => sum + log.focusSessions, 0)
          return Math.min(habits, 25) + Math.min(focus, 15)
        }
      },
      {
        id: 'streak-builder',
        title: 'Streak Builder',
        description: 'Build a 7-day quality streak',
        target: 7,
        xpReward: 650,
        icon: '🔥',
        color: 'from-orange-500 to-red-500',
        calculateProgress: (logs) => {
          // Calculate current streak from week logs
          const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          let streak = 0
          for (const log of sortedLogs) {
            if ((log.habitsCompleted * 2 + log.focusSessions * 1 - log.snusCount * 1) >= 3) {
              streak++
            } else {
              streak = 0
            }
          }
          return Math.min(streak, 7)
        }
      }
    ]
  }

  const getWeeklyMission = (weekLogs: DailyLog[]): Mission => {
    const templates = getWeeklyMissionTemplates()
    const weekNumber = getWeekNumber()
    
    // Get days remaining in the week
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysLeftInWeek = dayOfWeek === 0 ? 1 : 7 - dayOfWeek + 1 // Include today
    
    // Filter out impossible missions
    const achievableTemplates = templates.filter(template => {
      // If it's a streak mission, make sure it's achievable
      if (template.id === 'streak-builder') {
        return daysLeftInWeek >= template.target
      }
      return true // All other missions are achievable
    })
    
    // If no achievable missions, fallback to a simple one
    if (achievableTemplates.length === 0) {
      // Create a fallback mission that's always achievable
      const fallbackTemplate = {
        id: 'daily-boost',
        title: 'Daily Boost',
        description: `Complete ${Math.min(3, daysLeftInWeek * 2)} habits this week`,
        target: Math.min(10, daysLeftInWeek * 2),
        xpReward: 300,
        icon: '⚡',
        color: 'from-yellow-500 to-orange-500',
        calculateProgress: (logs: DailyLog[]) => logs.reduce((sum, log) => sum + log.habitsCompleted, 0)
      }
      
      const progress = fallbackTemplate.calculateProgress(weekLogs)
      
      return {
        id: fallbackTemplate.id,
        title: fallbackTemplate.title,
        description: fallbackTemplate.description,
        progress,
        target: fallbackTemplate.target,
        xpReward: fallbackTemplate.xpReward,
        type: 'weekly',
        icon: fallbackTemplate.icon,
        color: fallbackTemplate.color
      }
    }
    
    // Select from achievable missions
    const template = achievableTemplates[weekNumber % achievableTemplates.length]
    const progress = template.calculateProgress(weekLogs)
    
    return {
      id: template.id,
      title: template.title,
      description: template.description,
      progress,
      target: template.target,
      xpReward: template.xpReward,
      type: 'weekly',
      icon: template.icon,
      color: template.color
    }
  }

  const getNextMilestone = (logs: DailyLog[]): Mission | null => {
    // Calculate current streaks and totals
    const currentStreak = calculateCurrentStreak(logs)
    const totalHabits = logs.reduce((sum, log) => sum + log.habitsCompleted, 0)
    const totalFocus = logs.reduce((sum, log) => sum + log.focusSessions, 0)
    const cleanDays = logs.filter(log => log.snusCount === 0).length
    
    // Define milestone priorities
    const milestones = [
      {
        condition: currentStreak < 7,
        mission: {
          id: 'first-week-warrior',
          title: 'First Week Warrior',
          description: `${7 - currentStreak} days until 7-day habit streak`,
          progress: currentStreak,
          target: 7,
          xpReward: 300,
          type: 'milestone' as const,
          icon: '🔥',
          color: 'from-orange-500 to-red-500'
        }
      },
      {
        condition: currentStreak >= 7 && currentStreak < 30,
        mission: {
          id: 'monthly-master',
          title: 'Monthly Master',
          description: `${30 - currentStreak} days until 30-day streak`,
          progress: currentStreak,
          target: 30,
          xpReward: 1000,
          type: 'milestone' as const,
          icon: '🏆',
          color: 'from-yellow-500 to-orange-500'
        }
      },
      {
        condition: totalHabits < 100,
        mission: {
          id: 'habit-century',
          title: 'Habit Century',
          description: `${100 - totalHabits} habits until Centurion badge`,
          progress: totalHabits,
          target: 100,
          xpReward: 500,
          type: 'milestone' as const,
          icon: '💯',
          color: 'from-green-500 to-emerald-500'
        }
      },
      {
        condition: totalFocus < 50,
        mission: {
          id: 'focus-apprentice',
          title: 'Focus Apprentice',
          description: `${50 - totalFocus} sessions until Focus Master`,
          progress: totalFocus,
          target: 50,
          xpReward: 400,
          type: 'milestone' as const,
          icon: '🧠',
          color: 'from-blue-500 to-cyan-500'
        }
      },
      {
        condition: cleanDays < 10,
        mission: {
          id: 'clean-days',
          title: `Clean ${getHabitName()} Days`,
          description: `${10 - cleanDays} clean ${getHabitName().toLowerCase()} days until badge`,
          progress: cleanDays,
          target: 10,
          xpReward: 350,
          type: 'milestone' as const,
          icon: getHabitIcon(),
          color: 'from-green-500 to-emerald-500'
        }
      }
    ]
    
    // Return first applicable milestone
    const nextMilestone = milestones.find(m => m.condition)
    return nextMilestone ? nextMilestone.mission : null
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

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100)
  }

  const getDaysRemaining = () => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    if (dayOfWeek === 0) {
      // It's Sunday - calculate hours remaining until midnight
      const endOfDay = new Date(today)
      endOfDay.setHours(23, 59, 59, 999)
      const hoursLeft = Math.ceil((endOfDay.getTime() - today.getTime()) / (1000 * 60 * 60))
      return hoursLeft > 1 ? `${hoursLeft}h` : 'final hours'
    } else {
      // Days remaining in week (Monday = 6 days, Tuesday = 5 days, etc.)
      const daysLeft = 7 - dayOfWeek
      return `${daysLeft} days`
    }
  }

  const getTimeRemainingText = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    
    if (dayOfWeek === 0) {
      return 'left'
    } else {
      return 'left'
    }
  }

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {missions.map((mission) => {
        const missionId = getMissionId(mission)
        const isCompleted = completedMissions.has(missionId)
        const isJustCompleted = mission.progress >= mission.target && !isCompleted
        
        return (
          <Card key={mission.id} className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden hover:border-white/20 transition-all h-full">
            <CardContent className="p-6 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${mission.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg ${isCompleted ? 'opacity-60' : ''}`}>
                    {isCompleted ? '✅' : mission.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-1 ${isCompleted ? 'text-gray-400' : 'text-white'}`}>
                      {mission.title}
                      {isCompleted && <span className="text-green-400 ml-2">✓</span>}
                    </h3>
                    <p className="text-sm text-gray-400">{mission.description}</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4 flex-1">
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-sm font-medium ${isCompleted ? 'text-gray-400' : 'text-gray-300'}`}>
                    Progress
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm font-bold ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                      {Math.min(mission.progress, mission.target)} / {mission.target}
                    </span>
                    {mission.type === 'weekly' && !isCompleted && (
                      <span className="text-orange-400 text-sm font-medium">
                        {getDaysRemaining()} left
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="w-full bg-gray-800/60 rounded-full h-3 relative overflow-hidden border border-white/10 shadow-inner">
                  <div 
                    className={`bg-gradient-to-r ${isCompleted ? 'from-green-500 to-emerald-500' : mission.color} h-full rounded-full transition-all duration-1000 relative shadow-lg`}
                    style={{ width: `${getProgressPercentage(mission.progress, mission.target)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse opacity-50"></div>
                  </div>
                </div>
              </div>

              {/* Reward & Action */}
              <div className="flex items-center justify-between pt-2">
                <div className={`flex items-center space-x-2 ${isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {isCompleted ? 'Claimed' : '+'}{mission.xpReward} XP
                  </span>
                </div>
                
                {!isCompleted && (
                  <div className="flex items-center text-blue-400 text-sm">
                    <span className="mr-2">
                      {mission.target - mission.progress} to go
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Completion status */}
              {isCompleted && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <div className="flex items-center text-green-400 text-sm font-medium">
                    <Trophy className="h-4 w-4 mr-2" />
                    Mission Complete! XP Awarded
                  </div>
                </div>
              )}
              
              {isJustCompleted && !isCompleted && (
                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl animate-pulse">
                  <div className="flex items-center text-yellow-400 text-sm font-medium">
                    <Trophy className="h-4 w-4 mr-2" />
                    Ready to claim reward!
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 