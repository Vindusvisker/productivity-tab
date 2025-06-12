'use client'

import { useState } from 'react'
import { HelpCircle, Info, X, Clock, Plus, ExternalLink, Target, AlertTriangle, CheckCircle } from 'lucide-react'

export default function HomeHelp() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10"
      >
        <HelpCircle className="w-4 h-4 text-white/70" />
        <span className="text-sm text-white/80 font-medium">How Home Works</span>
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
                <Info className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Home Tab - Your Personal Dashboard</h2>
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
                
                {/* Home Tab Overview */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">🏠 What is the Home Tab?</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <p className="text-sm">Home is your central command center - the first thing you see when opening a new tab. It's designed for quick actions and daily tracking.</p>
                    <div className="bg-black/40 rounded-lg p-3 text-xs">
                      <div><strong>🕐 Time Display:</strong> Current time and date prominently shown</div>
                      <div><strong>📊 Habit Tracker:</strong> Log and monitor your daily tracked habit usage with smart feedback</div>
                      <div><strong>🚀 Quick Access:</strong> Fast links to your most-used tools and websites</div>
                    </div>
                  </div>
                </div>

                {/* Habit Tracker Explanation */}
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Plus className="w-6 h-6 text-red-400" />
                    <h3 className="text-lg font-bold text-white">📊 Habit Tracker (Right Side)</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-red-300 mb-2">Daily Limit System</h4>
                      <p className="text-sm">Track your habit usage with a daily limit you set. The tracker provides real-time feedback on your progress.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-300 mb-2">Smart Messaging</h4>
                      <p className="text-sm">Get personalized messages based on your usage count and your daily limit:</p>
                      <div className="mt-2 bg-black/40 rounded-lg p-3 text-xs font-mono">
                        <div>• <span className="text-green-400">0 used:</span> "Clean start — stay sharp and own the day 🧠"</div>
                        <div>• <span className="text-yellow-400">Below limit:</span> Awareness messages to keep you mindful</div>
                        <div>• <span className="text-orange-400">At limit:</span> "Limit reached. Time to lock in 🔒"</div>
                        <div>• <span className="text-red-400">Above limit:</span> Tough love messages to help you regain control</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-300 mb-2">How to Use</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Click "+" button:</strong> Log a habit usage (1-second cooldown prevents accidental clicks)</div>
                        <div>• <strong>Long-press "+" (3 seconds):</strong> Subtract last usage if logged by mistake</div>
                        <div>• <strong>Visual progress bar:</strong> See how close you are to your daily limit</div>
                        <div>• <strong>Auto-reset:</strong> Resets to 0 at midnight and logs yesterday's data</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-300 mb-2">Data Tracking</h4>
                      <p className="text-sm">Your daily habit usage automatically feeds into:</p>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Vision Tab:</strong> Calculates savings for financial goals</div>
                        <div>• <strong>Personal Tab:</strong> Shows in weekly overview and journey heatmap</div>
                        <div>• <strong>Success/Failure tracking:</strong> Days at or below your limit = success, above = failed day</div>
                      </div>
                    </div>
                    
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Anti-Spam Protection:</strong> 1-second cooldown prevents accidental rapid clicks. Long-press feature allows corrections.</p>
                    </div>
                  </div>
                </div>

                {/* Quick Access Explanation */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ExternalLink className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">🚀 Quick Access (Bottom)</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">What It Does</h4>
                      <p className="text-sm">One-click access to your most frequently used tools and websites. Perfect for new tab replacement workflow.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Available Links</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div className="bg-black/40 rounded-lg p-2">
                          <div><strong>🔧 Development:</strong></div>
                          <div>• GitHub</div>
                          <div>• Daily.dev</div>
                        </div>
                        <div className="bg-black/40 rounded-lg p-2">
                          <div><strong>🤖 AI Tools:</strong></div>
                          <div>• ChatGPT</div>
                          <div>• Claude AI</div>
                        </div>
                        <div className="bg-black/40 rounded-lg p-2">
                          <div><strong>📚 Productivity:</strong></div>
                          <div>• Gmail</div>
                          <div>• Google Calendar</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Features</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Hover effects:</strong> Cards scale slightly on hover</div>
                        <div>• <strong>Color-coded icons:</strong> Each service has its own gradient theme</div>
                        <div>• <strong>Opens in new tab:</strong> Doesn't disrupt your current workflow</div>
                        <div>• <strong>Responsive grid:</strong> 3-column layout that adapts to screen size</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Display */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white">🕐 Time Display (Left Side)</h3>
                  </div>
                  
                  <div className="space-y-3 text-white/80 text-sm">
                    <div><strong>Large Clock:</strong> Current time in HH:MM format, updates every second</div>
                    <div><strong>Date Display:</strong> Full date with weekday (e.g., "Monday, December 16, 2024")</div>
                    <div><strong>Hero Element:</strong> Central focus point with elegant animations on load</div>
                    <div><strong>Always Current:</strong> Real-time updates ensure accuracy</div>
                  </div>
                </div>

                {/* Animations & UX */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-bold text-white">✨ Animations & User Experience</h3>
                  </div>
                  
                  <div className="space-y-3 text-white/80 text-sm">
                    <div><strong>Staggered Entrance:</strong> Elements animate in sequence for smooth loading</div>
                    <div><strong>iOS-Style Animations:</strong> Smooth slide-up effects inspired by mobile design</div>
                    <div><strong>Performance:</strong> Lightweight components with smooth 60fps animations</div>
                    <div><strong>Accessibility:</strong> Clear focus states and keyboard navigation support</div>
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