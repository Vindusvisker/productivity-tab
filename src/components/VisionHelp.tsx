'use client'

import { useState } from 'react'
import { HelpCircle, Info, X, DollarSign, Calendar, Target, TrendingUp } from 'lucide-react'
import { UserConfig } from '../types/UserConfig'

export default function VisionHelp({ userConfig }: { userConfig?: UserConfig | null }) {
  const [isOpen, setIsOpen] = useState(false)

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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10"
      >
        <HelpCircle className="w-4 h-4 text-white/70" />
        <span className="text-sm text-white/80 font-medium">How Vision Works</span>
      </button>

      {/* Help Modal */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[80vh] bg-black/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-pink-400" />
                <h2 className="text-xl font-bold text-white">Vision Tab - How Your Financial Goals Work</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-8">
                
                {/* Vision Tab Overview */}
                <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-6 h-6 text-pink-400" />
                    <h3 className="text-lg font-bold text-white">🌟 What is the Vision Tab?</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <p className="text-sm">The Vision tab is your financial motivation center. It tracks your progress toward financial goals using two funding sources:</p>
                    <div className="bg-black/40 rounded-lg p-3 text-xs">
                      <div><strong>💚 {getHabitName()} Savings:</strong> Money saved by using fewer {getHabitName().toLowerCase()} than your baseline</div>
                      <div><strong>💰 Monthly Contributions:</strong> Your chosen amount is added automatically each month on your selected day</div>
                      <div><strong>🎯 Goal Tracking:</strong> Your total savings distributed across your financial goals by priority</div>
                    </div>
                  </div>
                </div>

                {/* Habit Savings Explanation */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">💰 {getHabitName()} Savings Calculator</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-emerald-300 mb-2">Step 1: Your Baseline is Established</h4>
                      <p className="text-sm">Your <strong>first week</strong> of tracking sets your "normal" {getHabitName().toLowerCase()} usage. For example, if you used a certain number of {getHabitName().toLowerCase()} in week 1, your baseline is calculated as your average per day.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-emerald-300 mb-2">Step 2: Daily Savings Calculation</h4>
                      <p className="text-sm">Every day after, the app compares your actual usage to your baseline:</p>
                      <div className="mt-2 bg-black/40 rounded-lg p-3 text-xs font-mono">
                        <div>• If your baseline is 5 and you use 3, you save 2 {getHabitName().toLowerCase()} × your unit cost = your daily savings</div>
                        <div>• If you use less than your baseline, you save more; if you use more, you save nothing that day</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-emerald-300 mb-2">Step 3: Positive-Only Accumulation</h4>
                      <p className="text-sm">Only <strong>good days</strong> add to your savings. Bad days don't subtract - they just don't add anything. This keeps you motivated by focusing on wins, not failures.</p>
                    </div>
                    
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Your current unit cost:</strong> Set in your profile as the cost per {getHabitName().toLowerCase()} and per package</p>
                    </div>
                  </div>
                </div>

                {/* Monthly Contributions Explanation */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">💰 Monthly Contributions</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">How It Works</h4>
                      <p className="text-sm">Every month on your chosen day, the app automatically adds your selected monthly contribution to your savings fund. This simulates a regular contribution to your financial goals.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Timeline</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Before your contribution day:</strong> No contribution added</div>
                        <div>• <strong>On your contribution day:</strong> Your chosen amount is automatically added</div>
                        <div>• <strong>After your contribution day:</strong> Contribution remains until next month</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Important:</strong> No retroactive contributions! If you start tracking mid-month, you only get contributions from your chosen day onwards.</p>
                    </div>
                  </div>
                </div>

                {/* Goal Distribution */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">🎯 How Savings Are Distributed to Goals</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Priority System</h4>
                      <p className="text-sm">Your total savings ({getHabitName().toLowerCase()} + monthly contributions) get distributed to goals based on:</p>
                      <div className="mt-2 bg-black/40 rounded-lg p-3 text-xs">
                        <div>1. <strong>Priority level:</strong> High → Medium → Low</div>
                        <div>2. <strong>Goal amount:</strong> Smaller goals get filled first within same priority</div>
                        <div>3. <strong>Waterfall effect:</strong> Once a goal is completed, excess goes to the next goal</div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Example:</strong> If you have a certain amount saved and a high-priority goal, your progress is shown as a percentage of your goal amount.</p>
                    </div>
                  </div>
                </div>

                {/* Daily Affirmations */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white">✨ Daily Affirmations</h3>
                  </div>
                  
                  <div className="space-y-3 text-white/80 text-sm">
                    <div><strong>Purpose:</strong> Keep you motivated with positive financial and health affirmations</div>
                    <div><strong>Categories:</strong> Money, Health, Freedom, Success, Habits, Motivation</div>
                    <div><strong>Auto-rotation:</strong> Changes every 15 seconds, or click Next/Random</div>
                    <div><strong>Filtering:</strong> Click category buttons to see specific types of affirmations</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 