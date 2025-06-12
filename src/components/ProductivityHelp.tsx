'use client'

import { useState } from 'react'
import { HelpCircle, Info, X, CheckCircle, Clock, Calendar, Target, Flame, TrendingUp, Play, Square } from 'lucide-react'

export default function ProductivityHelp() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10"
      >
        <HelpCircle className="w-4 h-4 text-white/70" />
        <span className="text-sm text-white/80 font-medium">How Productivity Works</span>
      </button>

      {/* Help Modal */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-5xl max-h-[85vh] bg-black/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-bold text-white">Productivity Tab - Your Daily Excellence System</h2>
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
                
                {/* Productivity Tab Overview */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-bold text-white">🎯 What is the Productivity Tab?</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <p className="text-sm">Productivity is your personal excellence system. Track habits, manage focus sessions, and visualize your weekly progress to build a life of consistent growth.</p>
                    <div className="bg-black/40 rounded-lg p-3 text-xs">
                      <div><strong>✅ Habit Tracker:</strong> Custom daily habits with smart tracking and streaks</div>
                      <div><strong>🍅 Focus Timer:</strong> Focus sessions with break management</div>
                      <div><strong>📊 Weekly Overview:</strong> Visual progress grid with detailed day breakdowns</div>
                    </div>
                  </div>
                </div>

                {/* Habit Tracker Explanation */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">✅ Habit Tracker (Left Column, Top)</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Default Habits (Customizable)</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-black/40 rounded-lg p-2">
                          <div>• 💪 First Workout</div>
                          <div>• ❌ No Alcohol</div>
                          <div>• ☀️ Second Workout</div>
                        </div>
                        <div className="bg-black/40 rounded-lg p-2">
                          <div>• 📚 Read</div>
                          <div>• 🍽️ Follow healthy diet</div>
                          <div>• 💧 Drink water</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">How to Use</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Click habit circles:</strong> Toggle completion status (filled = completed)</div>
                        <div>• <strong>Edit Mode Button:</strong> Enter customization mode to modify habits</div>
                        <div>• <strong>Add new habits:</strong> Type name and press enter to create custom habits</div>
                        <div>• <strong>Edit existing:</strong> Click edit icon to rename habits</div>
                        <div>• <strong>Delete habits:</strong> Use trash icon to remove unwanted habits</div>
                        <div>• <strong>Change icons:</strong> Click icon dropdown to customize visual appearance</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Smart Features</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Daily Reset:</strong> All habits reset to uncompleted at midnight</div>
                        <div>• <strong>Streak Tracking:</strong> Counts consecutive days of completing ALL habits</div>
                        <div>• <strong>Progress Persistence:</strong> Data syncs across tabs and browser sessions</div>
                        <div>• <strong>Legacy Migration:</strong> Automatically upgrades old habit data to new format</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Data Integration</h4>
                      <p className="text-sm">Completed habits feed into:</p>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Weekly Overview:</strong> Shows daily habit completion counts</div>
                        <div>• <strong>Personal Tab:</strong> Journey heatmap and achievement tracking</div>
                        <div>• <strong>Streak Calculations:</strong> Only days with ALL habits = success</div>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Pro Tip:</strong> Start small with a few habits. Consistency beats perfection - it's better to complete a few habits daily than fail at many.</p>
                    </div>
                  </div>
                </div>

                {/* Focus Timer Explanation */}
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-orange-400" />
                    <h3 className="text-lg font-bold text-white">🍅 Focus Timer (Left Column, Bottom)</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-orange-300 mb-2">Focus Sessions</h4>
                      <p className="text-sm">Advanced focus sessions with background persistence and smart break management.</p>
                      <div className="bg-black/40 rounded-lg p-3 text-xs mt-2">
                        <div>• <strong>Focus Sessions:</strong> Focused work intervals</div>
                        <div>• <strong>Break Modes:</strong> Short and long breaks</div>
                        <div>• <strong>Background Operation:</strong> Continues running when you switch tabs</div>
                        <div>• <strong>Auto-Transitions:</strong> Seamlessly moves between focus and break modes</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-orange-300 mb-2">How to Use</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Start Focus:</strong> Click to start a focus session</div>
                        <div>• <strong>Start Break:</strong> Click to take a break</div>
                        <div>• <strong>Stop Timer:</strong> Red stop button to end current session</div>
                        <div>• <strong>Visual Progress:</strong> Circular progress bar shows time remaining</div>
                        <div>• <strong>Session Counter:</strong> Tracks completed focus sessions for the day</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-orange-300 mb-2">Advanced Features</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Tab Switching:</strong> Timer continues in background, recalculates on return</div>
                        <div>• <strong>Pause Tracking:</strong> Remembers pause time for accurate session duration</div>
                        <div>• <strong>Session Persistence:</strong> Survives browser refresh and tab close/reopen</div>
                        <div>• <strong>Precise Timing:</strong> Uses actual elapsed time, not interval counting</div>
                        <div>• <strong>Automatic Save:</strong> Progress saved to storage every state change</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-orange-300 mb-2">Data Tracking</h4>
                      <p className="text-sm">Completed focus sessions contribute to:</p>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Daily Counter:</strong> Shows total focus sessions completed today</div>
                        <div>• <strong>Weekly Overview:</strong> Visual representation in progress grid</div>
                        <div>• <strong>Personal Journey:</strong> Feeds into overall productivity metrics</div>
                        <div>• <strong>Detailed Logs:</strong> Stores session start/end times for analysis</div>
                      </div>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Timer State Management:</strong> Your timer runs independently of the browser tab. Switch tabs freely - your session continues and recalculates when you return!</p>
                    </div>
                  </div>
                </div>

                {/* Weekly Overview Explanation */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">📊 Weekly Overview (Right Column)</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Visual Progress Grid</h4>
                      <p className="text-sm">Color-coded grid showing your daily performance across all productivity metrics.</p>
                      <div className="bg-black/40 rounded-lg p-3 text-xs mt-2">
                        <div>• <strong>Green Days:</strong> High productivity (good habits + focus sessions + low penalty habit usage)</div>
                        <div>• <strong>Yellow Days:</strong> Moderate productivity (mixed performance)</div>
                        <div>• <strong>Red Days:</strong> Low productivity (few habits, no focus, high penalty habit usage)</div>
                        <div>• <strong>Gray Days:</strong> No data or inactive day</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Scoring Algorithm</h4>
                      <p className="text-sm">Your daily score is calculated using a smart formula:</p>
                      <div className="bg-black/40 rounded-lg p-3 text-xs font-mono">
                        <div>Score = (Habits × 2) + (Focus Sessions × 1) - (Penalty Habit × 1)</div>
                        <div className="mt-2 text-gray-300">
                          <div>• <span className="text-green-400">Habits:</span> Worth 2 points each (high value for consistency)</div>
                          <div>• <span className="text-blue-400">Focus:</span> Worth 1 point each (rewards deep work)</div>
                          <div>• <span className="text-red-400">Penalty Habit:</span> Subtracts 1 point each (penalty for tracked habit usage)</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Interactive Features</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Click Any Day:</strong> Opens detailed breakdown dialog</div>
                        <div>• <strong>Day Details Modal:</strong> Shows habits, focus sessions, penalty habit usage</div>
                        <div>• <strong>Current Streak:</strong> Displays consecutive high-productivity days</div>
                        <div>• <strong>Success Rate:</strong> Percentage of successful days this week</div>
                        <div>• <strong>Real-time Updates:</strong> Grid updates as you complete activities</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Data Sources</h4>
                      <p className="text-sm">The overview intelligently combines data from:</p>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Habit Tracker:</strong> Daily habit completion counts and specific habits</div>
                        <div>• <strong>Focus Timer:</strong> Number of completed Pomodoro sessions</div>
                        <div>• <strong>Penalty Habit Tracker:</strong> Daily tracked habit usage for health scoring</div>
                        <div>• <strong>Legacy Data:</strong> Automatically migrates old formats to new unified system</div>
                        <div>• <strong>Multiple Formats:</strong> Supports both legacy and new data structures</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Smart Data Management</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Auto-Save:</strong> Current day data saved automatically as you work</div>
                        <div>• <strong>Manual Edit Protection:</strong> Won't overwrite manually edited day data</div>
                        <div>• <strong>Cross-Component Sync:</strong> Updates in real-time from all tabs</div>
                        <div>• <strong>Debounced Updates:</strong> Prevents flickering from rapid data changes</div>
                      </div>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Performance Insight:</strong> The grid uses a sophisticated scoring system to help you identify patterns. Green streaks show your peak performance periods!</p>
                    </div>
                  </div>
                </div>

                {/* System Integration */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white">🔗 System Integration</h3>
                  </div>
                  
                  <div className="space-y-3 text-white/80 text-sm">
                    <div><strong>Cross-Tab Data Sync:</strong> All productivity data syncs between Home, Personal, and Vision tabs</div>
                    <div><strong>Unified Data Format:</strong> New unified daily-logs system with legacy compatibility</div>
                    <div><strong>Real-time Updates:</strong> Changes propagate instantly across all components</div>
                    <div><strong>Browser Persistence:</strong> Data survives browser restarts and tab management</div>
                    <div><strong>Performance Optimized:</strong> Debounced updates and smart caching prevent lag</div>
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