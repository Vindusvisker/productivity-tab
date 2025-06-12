'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, Target, DollarSign, Clock, Package, Star, CheckCircle, User } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import { UserConfig } from '../types/UserConfig'

interface OnboardingDialogProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (config: UserConfig) => void
}

const addictionTypes = [
  { value: 'snus', label: 'Snus/Nicotine', icon: '🚭', description: 'Snus, nicotine pouches, chewing tobacco' },
  { value: 'tobacco', label: 'Smoking', icon: '🚬', description: 'Cigarettes, cigars, vaping' },
  { value: 'alcohol', label: 'Alcohol', icon: '🍺', description: 'Beer, wine, spirits' },
  { value: 'gambling', label: 'Gambling', icon: '🎰', description: 'Slots, poker, sports betting, lottery' },
  { value: 'other', label: 'Other', icon: '🎯', description: 'Custom habit or addiction' }
] as const

const currencies = [
  { value: 'NOK', label: 'Norwegian Krone (kr)', symbol: 'kr' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'SEK', label: 'Swedish Krona (kr)', symbol: 'kr' }
] as const

export default function OnboardingDialog({ isOpen, onClose, onComplete }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isCompleting, setIsCompleting] = useState(false)
  const [config, setConfig] = useState<UserConfig>({
    hasAddiction: false,
    addictionType: 'snus',
    addictionName: '',
    costPerUnit: 4.22,
    unitsPerPackage: 23,
    packageCost: 100,
    dailyLimit: 5,
    previousMonthlyConsumption: 20,
    hourlyRate: 200,
    currency: 'NOK',
    monthlyContribution: 2500,
    contributionDay: 15,
    firstName: '',
    motivation: '',
    onboardingCompleted: false
  })

  const totalSteps = config.hasAddiction ? 11 : 6

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    const finalConfig = { ...config, onboardingCompleted: true }
    
    try {
      await storage.save('user-config', finalConfig)
      onComplete(finalConfig)
      
      // Show loading state for 2 seconds then refresh
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Error saving user config:', error)
      setIsCompleting(false)
    }
  }

  const getStepTitle = () => {
    if (isCompleting) return "✨ Finalizing Setup"
    switch (currentStep) {
      case 1: return '👋 Welcome!'
      case 2: return '🎯 Habit Tracking'
      case 3: return config.hasAddiction ? '🎯 Habit Type' : '💰 Financial Setup'
      case 4: return config.hasAddiction ? '📊 Monthly Usage' : '📅 Savings Day'
      case 5: return config.hasAddiction ? '🎯 Daily Goal' : '🌟 Personal Touch'
      case 6: return config.hasAddiction ? '💰 Package Cost' : '🎉 All Set!'
      case 7: return config.hasAddiction ? '📦 Package Size' : ''
      case 8: return config.hasAddiction ? '⏰ Hourly Rate' : ''
      case 9: return config.hasAddiction ? '💰 Monthly Savings' : ''
      case 10: return config.hasAddiction ? '📅 Payday' : ''
      case 11: return config.hasAddiction ? '🌟 Motivation' : ''
      default: return 'Setup'
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return config.firstName.trim().length > 0
      case 2: return true
      case 3: 
        if (config.hasAddiction) return true // addiction type selection
        return config.monthlyContribution > 0
      case 4:
        if (config.hasAddiction) return config.previousMonthlyConsumption > 0
        return config.contributionDay > 0 && config.contributionDay <= 31
      case 5:
        if (config.hasAddiction) return config.dailyLimit > 0
        return config.monthlyContribution > 0
      case 6:
        if (config.hasAddiction) return config.costPerUnit > 0
        return true
      case 7:
        if (config.hasAddiction) return config.unitsPerPackage > 0
        return true
      case 8:
        if (config.hasAddiction) return config.hourlyRate > 0
        return true
      case 9:
        if (config.hasAddiction) return config.monthlyContribution > 0
        return true
      case 10:
        if (config.hasAddiction) return config.contributionDay > 0 && config.contributionDay <= 31
        return true
      case 11: return true
      default: return true
    }
  }

  const getCurrencySymbol = () => {
    return currencies.find(c => c.value === config.currency)?.symbol || 'kr'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-black/95 backdrop-blur-xl border border-white/20 text-white rounded-3xl p-0">
        
        {/* Header */}
        <DialogHeader className="p-4 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-white hover:bg-white/10 p-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ) : (
              <div className="w-12" />
            )}
            <DialogTitle className="text-lg font-bold">
              {getStepTitle()}
            </DialogTitle>
            <div className="text-xs text-gray-400">
              {currentStep}/{totalSteps}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-1 mt-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Step 1: Welcome & Name */}
          {currentStep === 1 && (
            <div className="text-center space-y-4">
              <div className="text-4xl mb-4">🌟</div>
              <h2 className="text-xl font-bold text-white">Let's personalize your system!</h2>
              <p className="text-gray-400 text-sm">This will help us tailor the experience to your goals and habits.</p>
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-left">
                <Label className="text-white text-sm mb-2 block">What should we call you?</Label>
                <Input
                  placeholder="Your first name"
                  value={config.firstName}
                  onChange={(e) => setConfig(prev => ({ ...prev, firstName: e.target.value }))}
                  className="bg-transparent border-none text-white placeholder:text-gray-400 text-base focus:ring-0"
                />
              </div>
            </div>
          )}

          {/* Step 2: Addiction Question */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h2 className="text-lg font-bold text-white mb-2">
                  {config.firstName ? `${config.firstName}, ` : ''}do you have a habit you're trying to quit?
                </h2>
                <p className="text-gray-400 text-sm">This helps us track savings and motivation</p>
              </div>

              <div className="grid gap-3">
                <button
                  onClick={() => setConfig(prev => ({ ...prev, hasAddiction: true }))}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    config.hasAddiction 
                      ? 'border-purple-500 bg-purple-500/20' 
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <div className="font-semibold text-white">Yes, I have a habit to quit</div>
                      <div className="text-sm text-gray-400">Track savings and progress</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setConfig(prev => ({ ...prev, hasAddiction: false }))}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    !config.hasAddiction 
                      ? 'border-purple-500 bg-purple-500/20' 
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">💰</div>
                    <div>
                      <div className="font-semibold text-white">No, just track savings & goals</div>
                      <div className="text-sm text-gray-400">Focus on financial goals</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Addiction Type (if has addiction) OR Monthly Contribution (if no addiction) */}
          {currentStep === 3 && config.hasAddiction && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h2 className="text-lg font-bold text-white mb-2">What type of habit?</h2>
              </div>

              <div className="space-y-2">
                {addictionTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setConfig(prev => ({ ...prev, addictionType: type.value as any }))}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      config.addictionType === type.value
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{type.icon}</div>
                      <div>
                        <div className="font-semibold text-white">{type.label}</div>
                        <div className="text-xs text-gray-400">{type.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <Label className="text-white text-sm mb-2 block">
                  Custom name (optional)
                </Label>
                <Input
                  placeholder={`e.g., "Premium ${addictionTypes.find(t => t.value === config.addictionType)?.label}"`}
                  value={config.addictionName}
                  onChange={(e) => setConfig(prev => ({ ...prev, addictionName: e.target.value }))}
                  className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm focus:ring-0"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && !config.hasAddiction && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <h2 className="text-lg font-bold text-white mb-2">Monthly Savings Goal</h2>
                <p className="text-gray-400 text-sm">How much do you want to save each month?</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {currencies.map((currency) => (
                  <button
                    key={currency.value}
                    onClick={() => setConfig(prev => ({ ...prev, currency: currency.value as any }))}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      config.currency === currency.value
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-lg font-bold text-white">{currency.symbol}</div>
                    <div className="text-xs text-gray-400">{currency.value}</div>
                  </button>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <Label className="text-white text-sm mb-2 block">Monthly amount</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="2500"
                    value={config.monthlyContribution}
                    onChange={(e) => setConfig(prev => ({ ...prev, monthlyContribution: Number(e.target.value) }))}
                    className="bg-transparent border-none text-white placeholder:text-gray-400 text-base focus:ring-0 flex-1"
                  />
                  <span className="text-gray-400">{getCurrencySymbol()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Monthly Usage (if addiction) OR Contribution Day (if no addiction) */}
          {currentStep === 4 && config.hasAddiction && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <h2 className="text-lg font-bold text-white mb-2">Monthly Usage</h2>
                <p className="text-gray-400 text-sm">How much did you typically consume before deciding to quit?</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <Label className="text-white text-sm mb-2 block">Packages per month</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="20"
                  value={config.previousMonthlyConsumption}
                  onChange={(e) => setConfig(prev => ({ ...prev, previousMonthlyConsumption: Number(e.target.value) }))}
                  className="bg-transparent border-none text-white placeholder:text-gray-400 text-base focus:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ MozAppearance: 'textfield' }}
                />
                <p className="text-xs text-gray-400 mt-1">
                  How many packages/packs/bottles did you typically finish per month before deciding to quit?
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && !config.hasAddiction && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">📅</div>
                <h2 className="text-lg font-bold text-white mb-2">Savings Day</h2>
                <p className="text-gray-400 text-sm">When do you get paid each month?</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <Label className="text-white text-sm mb-2 block">Day of the month</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="15"
                    value={config.contributionDay}
                    onChange={(e) => setConfig(prev => ({ ...prev, contributionDay: Number(e.target.value) }))}
                    className="bg-transparent border-none text-white placeholder:text-gray-400 text-base focus:ring-0 flex-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ MozAppearance: 'textfield' }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  We'll automatically add your monthly savings on this day
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Daily Goal (if addiction) OR Personal Touch (if no addiction) */}
          {currentStep === 5 && config.hasAddiction && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h2 className="text-lg font-bold text-white mb-2">Daily Goal</h2>
                <p className="text-gray-400 text-sm">What's your daily limit to stay on track?</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <Label className="text-white text-sm mb-2 block">Daily limit</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  placeholder="5"
                  value={config.dailyLimit}
                  onChange={(e) => setConfig(prev => ({ ...prev, dailyLimit: Number(e.target.value) }))}
                  className="bg-transparent border-none text-white placeholder:text-gray-400 text-base focus:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ MozAppearance: 'textfield' }}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Maximum number of units you aim to use per day to stay healthy
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="text-sm text-white/80">
                  <div>🎯 Your daily goal: {config.dailyLimit} units max</div>
                  <div>📊 Previous usage: ~{Math.round((config.previousMonthlyConsumption * config.unitsPerPackage) / 30)} units/day</div>
                  <div>📈 Reduction: {Math.max(0, Math.round((config.previousMonthlyConsumption * config.unitsPerPackage) / 30) - config.dailyLimit)} fewer units/day</div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && !config.hasAddiction && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🌟</div>
                <h2 className="text-lg font-bold text-white mb-2">Personal Touch</h2>
                <p className="text-gray-400 text-sm">What's your savings goal or motivation?</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <Label className="text-white text-sm mb-2 block">Your motivation (optional)</Label>
                <Input
                  placeholder="e.g., Emergency fund, vacation, new car, financial freedom..."
                  value={config.motivation}
                  onChange={(e) => setConfig(prev => ({ ...prev, motivation: e.target.value }))}
                  className="bg-transparent border-none text-white placeholder:text-gray-400 text-base focus:ring-0"
                />
              </div>
            </div>
          )}

          {/* Step 6: Package Cost + Currency (if addiction) OR Complete (if no addiction) */}
          {currentStep === 6 && config.hasAddiction && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <h2 className="text-lg font-bold text-white mb-2">Package Cost</h2>
                <p className="text-gray-400 text-sm">How much does one package typically cost?</p>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {currencies.map((currency) => (
                  <button
                    key={currency.value}
                    onClick={() => setConfig(prev => ({ ...prev, currency: currency.value as any }))}
                    className={`p-2 rounded-lg border transition-all text-center text-white text-sm font-medium ${
                      config.currency === currency.value
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div>{currency.symbol}</div>
                    <div className="text-[10px] text-gray-400">{currency.value}</div>
                  </button>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <Label className="text-white text-sm mb-2 block">Cost per package</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="97"
                    value={config.packageCost}
                    onChange={(e) => {
                      const packageCost = Number(e.target.value)
                      setConfig(prev => ({ 
                        ...prev, 
                        packageCost,
                        costPerUnit: packageCost / (prev.unitsPerPackage || 23)
                      }))
                    }}
                    className="bg-transparent border-none text-white placeholder:text-gray-400 text-base focus:ring-0 flex-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ MozAppearance: 'textfield' }}
                  />
                  <span className="text-gray-400">{getCurrencySymbol()}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Average price for one package/pack/bottle
                </p>
              </div>
            </div>
          )}

          {currentStep === 6 && !config.hasAddiction && (
            <div className="space-y-4 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-white">Perfect!</h2>
              <p className="text-gray-400">Your personal savings system is ready to go.</p>
              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-4 text-left">
                <div className="text-sm text-white/80">
                  <div>💰 Monthly savings: {config.monthlyContribution} {getCurrencySymbol()}</div>
                  <div>📅 Auto-added on the {config.contributionDay}th</div>
                  {config.motivation && <div>🌟 Goal: {config.motivation}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Package Size (if addiction) */}
          {currentStep === 7 && config.hasAddiction && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">📦</div>
                <h2 className="text-lg font-bold text-white mb-2">Package Size</h2>
                <p className="text-gray-400 text-sm">How many units come in one package?</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <Label className="text-white text-sm mb-2 block">Units per package</Label>
                <Input
                  type="number"
                  placeholder="23"
                  value={config.unitsPerPackage}
                  onChange={(e) => {
                    const unitsPerPackage = Number(e.target.value)
                    setConfig(prev => ({ 
                      ...prev, 
                      unitsPerPackage,
                      costPerUnit: (prev.packageCost || 97) / unitsPerPackage
                    }))
                  }}
                  className="bg-transparent border-none text-white placeholder:text-gray-400 text-base focus:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ MozAppearance: 'textfield' }}
                />
                <p className="text-xs text-gray-400 mt-1">
                  e.g., 23 snus per box, 20 cigarettes per pack, 1 bottle
                </p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <div className="text-sm text-white/80">
                  <div>Cost per unit: {config.costPerUnit.toFixed(2)} {getCurrencySymbol()}</div>
                  <div>Package cost: {config.packageCost} {getCurrencySymbol()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Hourly Rate (if addiction) */}
          {currentStep === 8 && config.hasAddiction && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">⏰</div>
                <h2 className="text-lg font-bold text-white mb-2">Hourly Rate</h2>
                <p className="text-gray-400 text-sm">This helps us show costs in "work minutes"</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <Label className="text-white text-sm mb-2 block">Your hourly rate</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="200"
                    value={config.hourlyRate}
                    onChange={(e) => setConfig(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                    className="bg-transparent border-none text-white placeholder:text-gray-400 text-base focus:ring-0 flex-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ MozAppearance: 'textfield' }}
                  />
                  <span className="text-gray-400">{getCurrencySymbol()}/hour</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Monthly salary ÷ working hours, or your freelance rate (gross/net - your choice)
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="text-sm text-white/80">
                  <div>Work time per unit: {((config.costPerUnit / config.hourlyRate) * 60).toFixed(1)} minutes</div>
                  <div>Work time per package: {((config.packageCost / config.hourlyRate) * 60).toFixed(1)} minutes</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 9: Monthly Savings (if addiction) */}
          {currentStep === 9 && config.hasAddiction && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <h2 className="text-lg font-bold text-white mb-2">Monthly Savings</h2>
                <p className="text-gray-400 text-sm">How much do you want to save each month?</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <Label className="text-white text-sm mb-2 block">Monthly contribution</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="2500"
                    value={config.monthlyContribution}
                    onChange={(e) => setConfig(prev => ({ ...prev, monthlyContribution: Number(e.target.value) }))}
                    className="bg-transparent border-none text-white placeholder:text-gray-400 text-base focus:ring-0 flex-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ MozAppearance: 'textfield' }}
                  />
                  <span className="text-gray-400">{getCurrencySymbol()}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  This will be added to your savings fund each month
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="text-sm text-white/80">
                  <div>💰 Habit savings: ~{(config.previousMonthlyConsumption * config.packageCost).toFixed(0)} {getCurrencySymbol()}/month</div>
                  <div>💵 Monthly contribution: {config.monthlyContribution} {getCurrencySymbol()}/month</div>
                  <div>🎯 Total potential: ~{(config.previousMonthlyConsumption * config.packageCost + config.monthlyContribution).toFixed(0)} {getCurrencySymbol()}/month</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 10: Payday (if addiction) */}
          {currentStep === 10 && config.hasAddiction && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">📅</div>
                <h2 className="text-lg font-bold text-white mb-2">Payday</h2>
                <p className="text-gray-400 text-sm">When do you get paid each month?</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <Label className="text-white text-sm mb-2 block">Day of the month</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="15"
                    value={config.contributionDay}
                    onChange={(e) => setConfig(prev => ({ ...prev, contributionDay: Number(e.target.value) }))}
                    className="bg-transparent border-none text-white placeholder:text-gray-400 text-base focus:ring-0 flex-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ MozAppearance: 'textfield' }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  We'll automatically add your monthly contribution on this day
                </p>
              </div>
            </div>
          )}

          {/* Step 11: Motivation + Complete (if addiction) */}
          {currentStep === 11 && config.hasAddiction && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🌟</div>
                <h2 className="text-lg font-bold text-white mb-2">Motivation</h2>
                <p className="text-gray-400 text-sm">What's driving you to quit and save?</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <Label className="text-white text-sm mb-2 block">Your motivation (optional)</Label>
                <Input
                  placeholder="e.g., Better health, more money for family, financial freedom..."
                  value={config.motivation}
                  onChange={(e) => setConfig(prev => ({ ...prev, motivation: e.target.value }))}
                  className="bg-transparent border-none text-white placeholder:text-gray-400 text-base focus:ring-0"
                />
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg p-4">
                <div className="text-sm text-white/80 space-y-1">
                  <div>🎯 Tracking: {config.addictionName || addictionTypes.find(t => t.value === config.addictionType)?.label}</div>
                  <div>📊 Previous usage: {config.previousMonthlyConsumption} packages/month</div>
                  <div>💰 Cost per unit: {config.costPerUnit.toFixed(2)} {getCurrencySymbol()}</div>
                  <div>📦 Units per package: {config.unitsPerPackage}</div>
                  <div>⏰ Work time per unit: {((config.costPerUnit / config.hourlyRate) * 60).toFixed(1)} minutes</div>
                  <div>💵 Monthly contribution: {config.monthlyContribution} {getCurrencySymbol()}</div>
                  <div>📅 Payday: {config.contributionDay}th of each month</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-lg font-bold text-white">You're all set!</h3>
                <p className="text-sm text-gray-400">Your personalized system is ready to help you succeed.</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          {isCompleting ? (
            <div className="text-center py-3">
              <div className="flex items-center justify-center space-x-3 text-white">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                <span className="text-base font-medium">Setting everything up...</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Your system will be ready in a moment</p>
            </div>
          ) : currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 rounded-lg text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isCompleting}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-lg text-base font-medium flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Complete Setup</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 