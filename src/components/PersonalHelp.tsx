'use client'

import { useState } from 'react'
import { HelpCircle, Info, X, User, Target, Calendar, Trophy, Heart, Crown, Zap, Star, TrendingUp } from 'lucide-react'

export default function PersonalHelp() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10"
      >
        <HelpCircle className="w-4 h-4 text-white/70" />
        <span className="text-sm text-white/80 font-medium">How Personal Works</span>
      </button>

      {/* Help Modal */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-6xl max-h-[85vh] bg-black/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Personal Tab - Your Journey & Growth Hub</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-8">
                
                {/* Personal Tab Overview */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">🧑‍💼 What is the Personal Tab?</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <p className="text-sm">Personal is your comprehensive growth and reflection center. Track your progress with XP leveling, complete dynamic missions, visualize your journey, unlock achievements, and reflect on your weekly experiences—no matter what habit you are tracking.</p>
                    <div className="bg-black/40 rounded-lg p-3 text-xs">
                      <div><strong>👤 Profile Header:</strong> XP leveling system with ranks, titles, and progress tracking</div>
                      <div><strong>🎯 Active Missions:</strong> Dynamic weekly challenges and milestone goals</div>
                      <div><strong>🗓️ Journey Heatmap:</strong> Visual activity calendar with manual editing</div>
                      <div><strong>🏆 Achievement Wall:</strong> Badge collection system across many achievements</div>
                      <div><strong>💭 Weekly Reflection:</strong> Mood tracking and journaling for personal growth</div>
                    </div>
                  </div>
                </div>

                {/* Profile Header Explanation */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-lg font-bold text-white">👤 Profile Header (Top Left)</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-yellow-300 mb-2">XP Leveling System</h4>
                      <p className="text-sm">Your progress is quantified through a sophisticated XP system that rewards all forms of personal development.</p>
                      <div className="bg-black/40 rounded-lg p-3 text-xs mt-2">
                        <div>• <strong>1,000 XP per level:</strong> Clean progression system</div>
                        <div>• <strong>Progress bar:</strong> Visual representation of current level progress</div>
                        <div>• <strong>Level titles:</strong> Novice → Rising Champion → Focus Master → Habit Virtuoso → Productivity Legend</div>
                        <div>• <strong>Rank system:</strong> Bronze → Silver → Gold → Platinum (visual rank badges)</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-yellow-300 mb-2">XP Sources & Calculation</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div><strong>📅 Daily Activity XP:</strong></div>
                        <div className="ml-2">• Habits: XP for each completed habit</div>
                        <div className="ml-2">• Focus Sessions: XP for each completed focus session</div>
                        <div className="ml-2">• Habit Penalty: XP penalty for tracked habit usage (if applicable)</div>
                        
                        <div className="mt-2"><strong>🔥 Streak Bonus XP:</strong></div>
                        <div className="ml-2">• Habit Streak: 100 XP per day of current streak</div>
                        <div className="ml-2">• Clean Streak: XP per day of current clean streak (no tracked habit usage)</div>
                        
                        <div className="mt-2"><strong>🎯 Mission & Achievement XP:</strong></div>
                        <div className="ml-2">• Weekly missions: 450-600 XP each</div>
                        <div className="ml-2">• Milestone missions: 500-1000 XP each</div>
                        <div className="ml-2">• Achievements: 50-2000 XP each</div>
                        
                        <div className="mt-2"><strong>💰 Bonus XP (From Profile Dialog):</strong></div>
                        <div className="ml-2">• Daily activity bonuses</div>
                        <div className="ml-2">• Weekly completion bonuses</div>
                        <div className="ml-2">• Monthly milestone bonuses</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-yellow-300 mb-2">Profile Statistics</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Days Active:</strong> Total days with recorded activity</div>
                        <div>• <strong>Completed Missions:</strong> Combines both missions and achievements</div>
                        <div>• <strong>Real-time Updates:</strong> Syncs automatically as you complete activities</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-yellow-300 mb-2">Interactive Features</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Click Profile:</strong> Opens detailed XP breakdown dialog</div>
                        <div>• <strong>XP Breakdown:</strong> Shows exactly where your XP comes from</div>
                        <div>• <strong>Bonus Claims:</strong> Daily/weekly/monthly bonus XP opportunities</div>
                        <div>• <strong>Cross-Component Sync:</strong> Updates when missions/achievements unlock</div>
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Level Up Strategy:</strong> Focus on consistency over intensity. Daily habit completion + moderate focus sessions + clean days = steady XP growth!</p>
                    </div>
                  </div>
                </div>

                {/* Active Missions Explanation */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">🎯 Active Missions (Top Right)</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Dynamic Mission System</h4>
                      <p className="text-sm">Two concurrent missions: one weekly rotating challenge and one long-term milestone goal.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Weekly Missions (Rotating)</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div><strong>🎯 Weekly Domination:</strong> Complete a set number of habits this week (XP reward)</div>
                        <div><strong>🧠 Focus Mastery:</strong> Complete a set number of focus sessions this week (XP reward)</div>
                        <div><strong>🌟 Clean Week Challenge:</strong> Have no tracked habit usage for several days this week (XP reward)</div>
                        <div><strong>👑 Consistency King:</strong> Have several days with high scores this week (XP reward)</div>
                        <div><strong>💪 Peak Performance:</strong> Have several days with very high scores this week (XP reward)</div>
                        <div><strong>🏃‍♂️ Marathon Week:</strong> Complete a high number of focus sessions this week (XP reward)</div>
                        <div><strong>🔥 Habit Inferno:</strong> Complete a high number of habits this week (XP reward)</div>
                        <div><strong>✨ Perfect Week:</strong> Have a week with all days above a certain score (XP reward)</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Milestone Missions (Long-term)</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div><strong>🎯 Total Habits:</strong> Reach progressive milestones for total habits completed</div>
                        <div><strong>🧠 Focus Hours:</strong> Reach progressive milestones for total focus hours</div>
                        <div><strong>🌟 Clean Days:</strong> Reach progressive milestones for days with no tracked habit usage</div>
                        <div><strong>🔥 Streak Master:</strong> Reach progressive milestones for productivity streaks</div>
                        <div><strong>Rewards:</strong> XP based on difficulty</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Mission Intelligence</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Progress Tracking:</strong> Real-time progress bars with exact numbers</div>
                        <div>• <strong>Time Awareness:</strong> Shows days remaining for weekly missions</div>
                        <div>• <strong>Smart Selection:</strong> Next milestone automatically selected based on progress</div>
                        <div>• <strong>Auto-Completion:</strong> XP awarded instantly when goals are met</div>
                        <div>• <strong>No Duplicates:</strong> Completed missions are never offered again</div>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Mission Strategy:</strong> Weekly missions reset every Monday. Focus on achievable goals early in the week to build momentum!</p>
                    </div>
                  </div>
                </div>

                {/* Journey Heatmap Explanation */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-bold text-white">🗓️ Journey Heatmap (Bottom Left)</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-green-300 mb-2">Visual Activity Calendar</h4>
                      <p className="text-sm">GitHub-style heatmap showing your daily performance with color-coded scoring system.</p>
                      <div className="bg-black/40 rounded-lg p-3 text-xs mt-2">
                        <div>• <strong>Green Squares:</strong> High scores (5+ points) - excellent days</div>
                        <div>• <strong>Light Green:</strong> Good scores (3-4 points) - solid progress</div>
                        <div>• <strong>Yellow:</strong> Moderate scores (1-2 points) - okay days</div>
                        <div>• <strong>Dark Blue:</strong> Zero score - neutral day</div>
                        <div>• <strong>Gray:</strong> No data recorded</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-green-300 mb-2">Scoring Formula</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs font-mono">
                        <div>Daily Score = (Habits × 2) + (Focus × 1) - (Snus × 1)</div>
                        <div className="mt-2 text-gray-300">• For your tracked habit, the penalty is subtracted from your daily score</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-green-300 mb-2">Interactive Features</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Hover Tooltips:</strong> Shows detailed breakdown for each day</div>
                        <div>• <strong>Click to Edit:</strong> Opens manual data editing dialog</div>
                        <div>• <strong>Month Navigation:</strong> Browse historical data (can't go into future)</div>
                        <div>• <strong>Real-time Updates:</strong> Syncs automatically with your daily activities</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-green-300 mb-2">Manual Data Editing</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Habit Selection:</strong> Choose from your current habit list</div>
                        <div>• <strong>Focus Sessions:</strong> Manual input for focus work</div>
                        <div>• <strong>Snus Count:</strong> Adjust daily snus usage</div>
                        <div>• <strong>Habit Count:</strong> Adjust daily tracked habit usage</div>
                        <div>• <strong>Data Protection:</strong> Manual edits won't be overwritten by automatic updates</div>
                        <div>• <strong>Dual Storage:</strong> Saves to both new unified format and legacy format</div>
                      </div>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Data Integrity:</strong> The heatmap is your source of truth for daily activity. It feeds XP calculations, mission progress, and achievement tracking!</p>
                    </div>
                  </div>
                </div>

                {/* Achievement Wall Explanation */}
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-6 h-6 text-orange-400" />
                    <h3 className="text-lg font-bold text-white">🏆 Achievement Wall (Bottom Center)</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-orange-300 mb-2">5-Page Achievement System</h4>
                      <p className="text-sm">30+ achievements across 5 progressive pages, from starter badges to legendary accomplishments.</p>
                      <div className="bg-black/40 rounded-lg p-3 text-xs mt-2">
                        <div><strong>📖 Page 1:</strong> "Starting Your Journey" - Basic milestones (6 achievements)</div>
                        <div><strong>🔥 Page 2:</strong> "Building Momentum" - Consistency challenges (6 achievements)</div>
                        <div><strong>💪 Page 3:</strong> "Serious Progress" - Major milestones (6 achievements)</div>
                        <div><strong>👑 Page 4:</strong> "Elite Performance" - Advanced goals (6 achievements)</div>
                        <div><strong>🌟 Page 5:</strong> "Legendary Status" - Ultimate challenges (6 achievements)</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-orange-300 mb-2">Achievement Categories</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div><strong>✅ Habit Achievements:</strong> Completion milestones and daily goals</div>
                        <div><strong>🧠 Focus Achievements:</strong> Session counts and time-based goals</div>
                        <div><strong>🌟 Clean Achievements:</strong> Clean days and streak challenges (no tracked habit usage)</div>
                        <div><strong>🔥 Streak Achievements:</strong> Consistency and momentum rewards</div>
                        <div><strong>🎯 Wildcard Achievements:</strong> Special combinations and unique goals</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-orange-300 mb-2">Example Achievement Tiers</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div><strong>🎯 Starter Spark:</strong> Complete a starter milestone for habits (XP reward)</div>
                        <div><strong>🏆 Focus Champion:</strong> Complete a starter milestone for focus sessions (XP reward)</div>
                        <div><strong>🌟 Clean Streak Master:</strong> Achieve a clean streak milestone (no tracked habit usage, XP reward)</div>
                        <div><strong>👑 Century Club:</strong> Complete a major milestone for habits (XP reward)</div>
                        <div><strong>🚀 Productivity Legend:</strong> Achieve a major productivity streak (XP reward)</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-orange-300 mb-2">Smart Features</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Progress Indicators:</strong> Shows current progress toward locked achievements</div>
                        <div>• <strong>Auto-Unlock:</strong> Achievements unlock automatically when conditions are met</div>
                        <div>• <strong>XP Integration:</strong> Achievement XP immediately adds to your profile level</div>
                        <div>• <strong>Visual Polish:</strong> Unlocked badges glow with golden effects</div>
                        <div>• <strong>Page Navigation:</strong> Browse through achievement tiers with arrow buttons</div>
                      </div>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Achievement Hunting:</strong> Focus on achievable goals first! Many achievements have prerequisite progressions that unlock more advanced challenges.</p>
                    </div>
                  </div>
                </div>

                {/* Weekly Reflection Explanation */}
                <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-6 h-6 text-pink-400" />
                    <h3 className="text-lg font-bold text-white">💭 Weekly Reflection (Bottom Right)</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-pink-300 mb-2">Mood Tracking & Journaling</h4>
                      <p className="text-sm">Apple Health-inspired mood tracking combined with guided journaling for personal growth and self-awareness.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-pink-300 mb-2">Mood System</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div><strong>📱 Apple Health Scale:</strong> 0-6 mood levels with color coding</div>
                        <div><strong>🏷️ Feeling Tags:</strong> Specific emotions (happy, anxious, excited, etc.)</div>
                        <div><strong>🌍 Context Tags:</strong> Situational factors (work, social, health, etc.)</div>
                        <div><strong>📝 Optional Notes:</strong> Free-form reflection on your mood</div>
                        <div><strong>🎨 Visual Feedback:</strong> Color-coded mood visualization</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-pink-300 mb-2">Smart Journaling</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div><strong>🔄 Rotating Prompts:</strong> 8 different weekly prompts that cycle automatically</div>
                        <div>• "What made you feel proud this week?"</div>
                        <div>• "Any regrets you want to process?"</div>
                        <div>• "What would success look like next week?"</div>
                        <div>• "What patterns did you notice in your mood?"</div>
                        <div>• "What gave you the most energy this week?"</div>
                        <div>• "How did you handle challenges this week?"</div>
                        <div>• "What are you most grateful for?"</div>
                        <div>• "What would you do differently?"</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-pink-300 mb-2">Weekly Navigation</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Week Browsing:</strong> Navigate through past weeks to review mood patterns</div>
                        <div>• <strong>Current Week Focus:</strong> Always highlights "This Week" when viewing current period</div>
                        <div>• <strong>Historical Insights:</strong> Review mood trends and journal entries over time</div>
                        <div>• <strong>Future Blocking:</strong> Can't navigate beyond current week</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-pink-300 mb-2">Interactive Features</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Daily Mood Dialog:</strong> Appears automatically for new users (today only)</div>
                        <div>• <strong>Click Any Day:</strong> Edit mood and reflection for past days</div>
                        <div>• <strong>Mood Visualization:</strong> 7-day mood overview with color indicators</div>
                        <div>• <strong>Journal Entry:</strong> Weekly notes tied to rotating prompts</div>
                        <div>• <strong>Mood Insights:</strong> Automatic insights based on mood patterns</div>
                      </div>
                    </div>

                    <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Mental Health Focus:</strong> Regular mood tracking and reflection help identify patterns, process emotions, and maintain mental wellness alongside physical goals.</p>
                    </div>
                  </div>
                </div>

                {/* System Integration */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white">🔗 Personal Tab Integration</h3>
                  </div>
                  
                  <div className="space-y-3 text-white/80 text-sm">
                    <div><strong>Cross-Component Communication:</strong> All Personal components listen for updates and sync in real-time</div>
                    <div><strong>Unified Data Hub:</strong> Journey Heatmap serves as the central data source for XP, missions, and achievements</div>
                    <div><strong>XP Calculation Chain:</strong> Daily logs → XP calculation → Profile updates → Mission progress → Achievement unlocks</div>
                    <div><strong>Legacy Support:</strong> Maintains compatibility with old Productivity tab data formats</div>
                    <div><strong>Manual Override:</strong> Heatmap editing provides data correction without breaking automation</div>
                    <div><strong>Reflection Independence:</strong> Weekly Reflection operates independently for privacy and mental health focus</div>
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