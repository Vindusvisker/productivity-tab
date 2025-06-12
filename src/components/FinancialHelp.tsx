'use client'

import { useState } from 'react'
import { HelpCircle, Info, X, DollarSign, TrendingDown, Package, Calendar, Plus, CreditCard, AlertCircle } from 'lucide-react'

export default function FinancialHelp() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10"
      >
        <HelpCircle className="w-4 h-4 text-white/70" />
        <span className="text-sm text-white/80 font-medium">How Financial Works</span>
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
                <h2 className="text-xl font-bold text-white">Financial Tab - Your Money Management Center</h2>
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
                
                {/* Financial Tab Overview */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-bold text-white">💰 What is the Financial Tab?</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <p className="text-sm">Financial is your comprehensive money tracking and awareness center. Monitor the true cost of your tracked habit and manage all your subscriptions in one place to maintain financial discipline.</p>
                    <div className="bg-black/40 rounded-lg p-3 text-xs">
                      <div><strong>📊 Habit Impact Tracker:</strong> Real-time cost analysis and time-value calculations</div>
                      <div><strong>💳 Subscription Tracker:</strong> Complete subscription management with forecasting</div>
                    </div>
                  </div>
                </div>

                {/* Snus Impact Tracker Explanation */}
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingDown className="w-6 h-6 text-red-400" />
                    <h3 className="text-lg font-bold text-white">📊 Snus Impact Tracker (Left Column)</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-red-300 mb-2">Financial Impact Analysis</h4>
                      <p className="text-sm">Real-time calculation of your habit costs and their equivalent in work time using your actual hourly rate.</p>
                      <div className="bg-black/40 rounded-lg p-3 text-xs mt-2">
                        <div>• <strong>Live Data Integration:</strong> Syncs with your main habit tracker automatically</div>
                        <div>• <strong>Multiple Time Periods:</strong> Today, this week, this month, and total tracking</div>
                        <div>• <strong>Work Time Conversion:</strong> Shows how many minutes you work to afford your habit</div>
                        <div>• <strong>Baseline Comparison:</strong> Tracks usage avoided vs. your historical average</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-300 mb-2">Precise Financial Calculations</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div><strong>💰 Cost Inputs:</strong></div>
                        <div className="ml-2">• Your unit cost: Set in your profile as the cost per habit and per package</div>
                        <div className="ml-2">• Your hourly rate: Set in your profile for work time calculations</div>
                        <div className="ml-2">• Time per unit: How many minutes of work each unit of your habit costs you</div>
                        <div className="mt-2"><strong>📦 Package Tracking:</strong></div>
                        <div className="ml-2">• Calculates total packages bought (rounds up for full packages)</div>
                        <div className="ml-2">• Uses your configured units per package and package cost</div>
                        <div className="mt-2"><strong>⏰ Time Value Analysis:</strong></div>
                        <div className="ml-2">• Today: Exact minutes worked to afford today's habit</div>
                        <div className="ml-2">• Weekly/Monthly: Cumulative work time impact</div>
                        <div className="ml-2">• Visual representation of time vs. money</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-300 mb-2">Smart Baseline System</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Historical Analysis:</strong> Calculates your average daily habit usage</div>
                        <div>• <strong>Avoided Usage Tracking:</strong> Shows units not taken vs. your baseline</div>
                        <div>• <strong>Progress Awareness:</strong> Highlights reduction in usage over time</div>
                        <div>• <strong>Data Sources:</strong> Uses all available habit data from daily logs</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-300 mb-2">Data Integration</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Main Habit Tracker:</strong> Real-time sync with daily habit counts</div>
                        <div>• <strong>Daily Logs:</strong> Comprehensive historical data analysis</div>
                        <div>• <strong>Legacy Support:</strong> Merges old and new data formats seamlessly</div>
                        <div>• <strong>Live Updates:</strong> Refreshes automatically when your habit count changes</div>
                      </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Financial Awareness:</strong> Seeing your habit costs in work minutes makes the financial impact visceral and motivates reduction!</p>
                    </div>
                  </div>
                </div>

                {/* Subscription Tracker Explanation */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">💳 Subscription Tracker (Right Column)</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Complete Subscription Management</h4>
                      <p className="text-sm">Track all your recurring subscriptions with renewal monitoring, cost forecasting, and subscription lifecycle management.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Subscription Creation & Editing</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div><strong>📝 Comprehensive Details:</strong></div>
                        <div className="ml-2">• Name, price, and renewal date</div>
                        <div className="ml-2">• Custom icons (💻📱🎵🎬🏃☁️🛡️🏠📚🤖) and colors</div>
                        <div className="ml-2">• Categories (Entertainment, Productivity, Health, etc.)</div>
                        <div className="ml-2">• Payment methods (Credit Card, PayPal, Bank Transfer, etc.)</div>
                        <div className="ml-2">• Billing cycles (Weekly, Monthly, Yearly)</div>
                        <div className="ml-2">• Reminder settings for upcoming renewals</div>
                        
                        <div className="mt-2"><strong>🔧 Smart Features:</strong></div>
                        <div className="ml-2">• Automatic renewal date calculation</div>
                        <div className="ml-2">• Edit existing subscriptions</div>
                        <div className="ml-2">• Free subscription tracking (price = 0)</div>
                        <div className="ml-2">• Start date handling for future subscriptions</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Renewal Monitoring & Status</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div><strong>🚨 Status Indicators:</strong></div>
                        <div className="ml-2">• <span className="text-green-400">Active:</span> More than 7 days until renewal</div>
                        <div className="ml-2">• <span className="text-yellow-400">Upcoming:</span> 7 days or less until renewal</div>
                        <div className="ml-2">• <span className="text-red-400">Overdue:</span> Renewal date has passed</div>
                        
                        <div className="mt-2"><strong>📅 Time Tracking:</strong></div>
                        <div className="ml-2">• Exact days until next renewal</div>
                        <div className="ml-2">• Handles negative days for overdue subscriptions</div>
                        <div className="ml-2">• Dynamic status updates based on current date</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Financial Forecasting</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div><strong>💰 Cost Analysis:</strong></div>
                        <div className="ml-2">• Monthly Total: Sum of all monthly subscription costs</div>
                        <div className="ml-2">• Due This Month: Subscriptions renewing within 30 days</div>
                        <div className="ml-2">• Due This Year: Projected yearly cost from current subscriptions</div>
                        
                        <div className="mt-2"><strong>📊 Smart Calculations:</strong></div>
                        <div className="ml-2">• Handles different billing cycles (weekly/monthly/yearly)</div>
                        <div className="ml-2">• Pro-rates costs for remaining months in year</div>
                        <div className="ml-2">• Real-time total updates as subscriptions change</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Organization & Filtering</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div><strong>🔍 Sorting Options:</strong></div>
                        <div className="ml-2">• By Name: Alphabetical subscription list</div>
                        <div className="ml-2">• By Price: Highest to lowest cost</div>
                        <div className="ml-2">• By Renewal: Soonest renewals first</div>
                        
                        <div className="mt-2"><strong>🗂️ Visual Organization:</strong></div>
                        <div className="ml-2">• Custom icons and colors for easy identification</div>
                        <div className="ml-2">• Category-based grouping</div>
                        <div className="ml-2">• Status-based visual cues</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Subscription Lifecycle</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div><strong>🗑️ Subscription Deletion:</strong></div>
                        <div className="ml-2">• Automatic history entry creation</div>
                        <div className="ml-2">• Duration tracking (start to end date)</div>
                        <div className="ml-2">• Total paid estimation</div>
                        
                        <div className="mt-2"><strong>📜 History Management:</strong></div>
                        <div className="ml-2">• View past subscription history</div>
                        <div className="ml-2">• Track money spent on cancelled services</div>
                        <div className="ml-2">• Analyze subscription patterns over time</div>
                        
                        <div className="mt-2"><strong>💾 Data Persistence:</strong></div>
                        <div className="ml-2">• Automatic save to browser storage</div>
                        <div className="ml-2">• Separate active and history storage</div>
                        <div className="ml-2">• Data survives browser restarts</div>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-sm"><strong>Subscription Strategy:</strong> Regular review helps identify unused subscriptions and optimize spending. Set reminders to evaluate value before renewals!</p>
                    </div>
                  </div>
                </div>

                {/* Additional Dialogs & Features */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">🔧 Advanced Features</h3>
                  </div>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Subscription Details Dialog</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Full Information View:</strong> Complete subscription details in modal</div>
                        <div>• <strong>Quick Actions:</strong> Edit or delete subscriptions directly</div>
                        <div>• <strong>Renewal Information:</strong> Detailed renewal date and status</div>
                        <div>• <strong>Visual Design:</strong> Color-coded display with custom icons</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Subscription History Dialog</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Historical Analysis:</strong> View all previously cancelled subscriptions</div>
                        <div>• <strong>Cost Tracking:</strong> Total amount spent on each cancelled service</div>
                        <div>• <strong>Duration Analysis:</strong> How long each subscription was active</div>
                        <div>• <strong>Financial Insights:</strong> Identify spending patterns and trends</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Smart Date Calculations</h4>
                      <div className="bg-black/40 rounded-lg p-3 text-xs">
                        <div>• <strong>Billing Cycle Logic:</strong> Handles monthly edge cases (Feb 30th → Feb 28th)</div>
                        <div>• <strong>Future Subscriptions:</strong> Supports subscriptions starting in the future</div>
                        <div>• <strong>Timezone Safety:</strong> Avoids date calculation errors across timezones</div>
                        <div>• <strong>Leap Year Support:</strong> Correctly handles yearly renewals</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Integration */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white">🔗 Financial Tab Integration</h3>
                  </div>
                  
                  <div className="space-y-3 text-white/80 text-sm">
                    <div><strong>Real-time Habit Cost Tracking:</strong> Habit Impact Tracker updates automatically as you log your habit in the main tab</div>
                    <div><strong>Independent Subscription Management:</strong> Subscriptions operate independently for privacy and flexibility</div>
                    <div><strong>Comprehensive Data Sources:</strong> Merges multiple data formats for complete historical analysis</div>
                    <div><strong>Financial Awareness Focus:</strong> Both components emphasize cost consciousness and spending awareness</div>
                    <div><strong>Browser Storage:</strong> All data persists locally in browser for privacy and speed</div>
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