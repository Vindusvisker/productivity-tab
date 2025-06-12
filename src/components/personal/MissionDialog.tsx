'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Lock, Zap, Calendar, Target, Trophy } from 'lucide-react'
import { UserConfig } from '../../types/UserConfig'

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
  detailedDescription?: string
  tips?: string[]
}

interface MissionDialogProps {
  achievement: Achievement | null
  isOpen: boolean
  onClose: () => void
  userConfig?: UserConfig | null
}

export default function MissionDialog({ achievement, isOpen, onClose, userConfig }: MissionDialogProps) {
  if (!achievement) return null

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'habit': return 'from-purple-500 to-pink-500'
      case 'focus': return 'from-blue-500 to-cyan-500'
      case 'snus': return 'from-green-500 to-emerald-500'
      case 'streak': return 'from-orange-500 to-red-500'
      case 'wildcard': return 'from-yellow-500 to-orange-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'habit': return 'Habit Mastery'
      case 'focus': return 'Focus & Flow'
      case 'snus': return `${getHabitName()} Resistance`
      case 'streak': return 'Streaks & Discipline'
      case 'wildcard': return 'Special Achievements'
      default: return 'Achievement'
    }
  }

  const getDetailedDescription = (id: string) => {
    const descriptions: Record<string, { detailed: string, tips: string[] }> = {
      'starter-spark': {
        detailed: 'Your first steps into habit building! Complete any 5 habits total to unlock this foundational achievement. This badge represents the beginning of your transformation journey.',
        tips: [
          'Start with small, easy habits to build momentum',
          'Track your habits consistently in the Journey Heatmap',
          'Focus on completion rather than perfection'
        ]
      },
      'flow-initiate': {
        detailed: 'Enter the realm of deep work by completing 5 focus sessions. Each session represents your commitment to undivided attention and productivity.',
        tips: [
          'Use the Pomodoro technique for structured focus',
          'Eliminate distractions before starting sessions',
          'Start with shorter sessions if needed'
        ]
      },
      'clean-day': {
        detailed: `Achieve your first completely ${getHabitName().toLowerCase()}-free day. This milestone represents your first victory over unwanted habits and the beginning of healthier choices.`,
        tips: [
          `Replace ${getHabitName().toLowerCase()} times with healthy alternatives`,
          `Track triggers that lead to ${getHabitName().toLowerCase()} use`,
          'Celebrate small wins along the way'
        ]
      },
      'mission-master': {
        detailed: 'Demonstrate consistency by completing 3 weekly missions. This achievement shows your ability to commit to structured challenges and see them through.',
        tips: [
          'Focus on one mission at a time',
          'Break weekly goals into daily targets',
          'Use the mission deadline for motivation'
        ]
      },
      'streak-lord': {
        detailed: 'The ultimate consistency achievement! Maintain a 30-day quality streak where each day scores 3+ points. This represents true habit mastery.',
        tips: [
          'Build daily routines that support your goals',
          'Have backup plans for challenging days',
          'Track your streak daily for motivation'
        ]
      },
      'perfectionist': {
        detailed: 'Achieve peak daily performance by scoring 10+ points in a single day. This shows your ability to have exceptional days of habits, focus, and discipline.',
        tips: [
          'Plan high-score days in advance',
          'Combine multiple habits with focus sessions',
          'Avoid any negative behaviors on these days'
        ]
      }
    }

    return descriptions[id] || {
      detailed: achievement.description,
      tips: ['Keep working towards this achievement!']
    }
  }

  const { detailed, tips } = getDetailedDescription(achievement.id)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 border border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
              achievement.unlocked
                ? `bg-gradient-to-br ${getCategoryColor(achievement.category)} shadow-lg`
                : 'bg-gray-700 opacity-50'
            }`}>
              {achievement.unlocked ? achievement.icon : <Lock className="h-6 w-6 text-gray-400" />}
            </div>
            <div>
              <span>{achievement.title}</span>
              {achievement.unlocked && (
                <CheckCircle className="h-5 w-5 text-green-400 inline ml-2" />
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className={`bg-gradient-to-r ${getCategoryColor(achievement.category)} text-white border-none`}
            >
              {getCategoryName(achievement.category)}
            </Badge>
            <div className="flex items-center space-x-2 text-yellow-400">
              <Zap className="h-4 w-4" />
              <span className="font-medium">+{achievement.xpReward} XP</span>
            </div>
          </div>

          {/* Status */}
          <div className={`p-4 rounded-xl border ${
            achievement.unlocked 
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-blue-500/10 border-blue-500/30'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {achievement.unlocked ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-medium">Achievement Unlocked!</span>
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">In Progress</span>
                </>
              )}
            </div>
            {achievement.progress && !achievement.unlocked && (
              <p className="text-sm text-gray-300">
                Progress: {achievement.progress}
              </p>
            )}
            {achievement.unlocked && achievement.dateUnlocked && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Unlocked {new Date(achievement.dateUnlocked).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Detailed Description */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Description</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {detailed}
            </p>
          </div>

          {/* Tips */}
          {!achievement.unlocked && tips.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Tips to Unlock</h4>
              <ul className="space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-400 flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Achievement Rarity */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Achievement ID: {achievement.id}</span>
              <div className="flex items-center space-x-1">
                <Trophy className="h-3 w-3" />
                <span>
                  {achievement.xpReward >= 1000 ? 'Legendary' :
                   achievement.xpReward >= 500 ? 'Epic' :
                   achievement.xpReward >= 300 ? 'Rare' :
                   achievement.xpReward >= 200 ? 'Uncommon' : 'Common'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 