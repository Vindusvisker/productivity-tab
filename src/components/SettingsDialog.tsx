'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Settings, Download, Trash2, AlertTriangle, CheckCircle, User, DollarSign, Clock, Target, Edit3 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { storage } from '@/lib/chrome-storage'
import { UserConfig } from '../types/UserConfig'

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  userConfig?: UserConfig
  onConfigUpdate?: (config: UserConfig) => void
}

export default function SettingsDialog({ isOpen, onClose, userConfig, onConfigUpdate }: SettingsDialogProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [showConfigEdit, setShowConfigEdit] = useState(false)
  const [editingConfig, setEditingConfig] = useState<UserConfig | null>(userConfig || null)
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // Get all data from Chrome storage
      const allData: Record<string, any> = {}
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        // Get all storage data
        const result = await chrome.storage.local.get(null)
        Object.assign(allData, result)
      }

      // Create export object with metadata
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: allData
      }

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `new-tab-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Error exporting data:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleResetData = async () => {
    setIsResetting(true)
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        // Clear all Chrome storage
        await chrome.storage.local.clear()
      }

      setResetSuccess(true)
      setTimeout(() => {
        setResetSuccess(false)
        // Reload the page to reinitialize with defaults
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Error resetting data:', error)
    } finally {
      setIsResetting(false)
      setShowResetConfirm(false)
    }
  }

  const handleConfigSave = async () => {
    try {
      if (editingConfig) {
        await storage.save('user-config', editingConfig)
        if (onConfigUpdate) {
          onConfigUpdate(editingConfig)
        }
        setConfigSaveSuccess(true)
        setTimeout(() => setConfigSaveSuccess(false), 3000)
        setShowConfigEdit(false)
      }
    } catch (error) {
      console.error('Error saving config:', error)
    }
  }

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'SEK': return 'kr'
      case 'NOK': 
      default: return 'kr'
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5" />
              Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Personal Configuration Section */}
            {userConfig && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white/90">Personal Configuration</h3>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      setEditingConfig(userConfig)
                      setShowConfigEdit(true)
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Personal Settings
                  </Button>
                  {configSaveSuccess && (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Configuration updated successfully!
                    </div>
                  )}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/70 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{userConfig.firstName}</span>
                      </div>
                      {userConfig.hasAddiction && (
                        <>
                          <div className="flex items-center gap-2">
                            <Target className="h-3 w-3" />
                            <span>Tracking: {userConfig.addictionName || userConfig.addictionType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3" />
                            <span>{userConfig.costPerUnit} {getCurrencySymbol(userConfig.currency)} per unit</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{userConfig.hourlyRate} {getCurrencySymbol(userConfig.currency)}/hour</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3" />
                        <span>Monthly savings: {userConfig.monthlyContribution} {getCurrencySymbol(userConfig.currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/90">Data Management</h3>
              
              {/* Export Data */}
              <div className="space-y-2">
                <Button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export Data
                    </>
                  )}
                </Button>
                {exportSuccess && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Data exported successfully!
                  </div>
                )}
                <p className="text-xs text-white/60">
                  Download a backup of all your settings, quick links, and preferences.
                </p>
              </div>

              {/* Reset Data */}
              <div className="space-y-2">
                <Button
                  onClick={() => setShowResetConfirm(true)}
                  disabled={isResetting}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  {isResetting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Reset All Data
                    </>
                  )}
                </Button>
                {resetSuccess && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Data reset successfully! Reloading...
                  </div>
                )}
                <p className="text-xs text-white/60">
                  Clear all data and return to default settings. This cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Confirm Data Reset
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-white/70 mb-4">
              This will permanently delete <strong>ALL</strong> extension data including:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2 text-white/70">
              <li><strong>All view data:</strong> Productivity habits, personal goals, financial subscriptions, vision board items, and home customizations</li>
              <li><strong>User preferences:</strong> Theme settings, quick access links, and all custom configurations</li>
              <li><strong>Progress & history:</strong> Streaks, achievements, tracking data, and all saved progress across the entire extension</li>
            </ul>
            <p className="text-white/70">
              <strong>This action cannot be undone.</strong> The extension will be completely reset to factory defaults. Consider exporting your data first.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetData}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Reset All Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configuration Edit Dialog */}
      <Dialog open={showConfigEdit} onOpenChange={setShowConfigEdit}>
        <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit3 className="h-5 w-5" />
              Edit Personal Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            {editingConfig && (
              <>
                {/* Name */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <Label className="text-white text-sm mb-2 block">First Name</Label>
                                     <Input
                     value={editingConfig?.firstName || ''}
                     onChange={(e) => setEditingConfig(prev => prev ? ({ ...prev, firstName: e.target.value }) : null)}
                     className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm focus:ring-0"
                   />
                </div>

                {/* Addiction Settings (if applicable) */}
                {editingConfig.hasAddiction && (
                  <>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <Label className="text-white text-sm mb-2 block">Custom Habit Name</Label>
                                             <Input
                         value={editingConfig?.addictionName || ''}
                         onChange={(e) => setEditingConfig(prev => prev ? ({ ...prev, addictionName: e.target.value } as UserConfig) : null)}
                         className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm focus:ring-0"
                         placeholder="e.g., Premium Snus"
                       />
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <Label className="text-white text-sm mb-2 block">Cost per unit</Label>
                      <div className="flex items-center space-x-2">
                                                 <Input
                           type="number"
                           step="0.01"
                           value={editingConfig?.costPerUnit || 0}
                           onChange={(e) => setEditingConfig(prev => prev ? ({ ...prev, costPerUnit: Number(e.target.value) } as any) : null)}
                           className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm focus:ring-0 flex-1"
                         />
                         <span className="text-gray-400 text-sm">{getCurrencySymbol(editingConfig?.currency || 'NOK')}</span>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <Label className="text-white text-sm mb-2 block">Hourly Rate</Label>
                      <div className="flex items-center space-x-2">
                                                 <Input
                           type="number"
                           step="0.01"
                           value={editingConfig?.hourlyRate || 0}
                           onChange={(e) => setEditingConfig(prev => prev ? ({ ...prev, hourlyRate: Number(e.target.value) } as any) : null)}
                           className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm focus:ring-0 flex-1"
                         />
                         <span className="text-gray-400 text-sm">{getCurrencySymbol(editingConfig?.currency || 'NOK')}/hour</span>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <Label className="text-white text-sm mb-2 block">Units per package</Label>
                                             <Input
                         type="number"
                         value={editingConfig?.unitsPerPackage || 0}
                         onChange={(e) => setEditingConfig(prev => prev ? ({ 
                           ...prev, 
                           unitsPerPackage: Number(e.target.value),
                           packageCost: Number(e.target.value) * (prev.costPerUnit || 0)
                         } as any) : null)}
                         className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm focus:ring-0"
                       />
                    </div>
                  </>
                )}

                {/* Financial Settings */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <Label className="text-white text-sm mb-2 block">Monthly Savings Contribution</Label>
                  <div className="flex items-center space-x-2">
                                         <Input
                       type="number"
                       value={editingConfig?.monthlyContribution || 0}
                       onChange={(e) => setEditingConfig(prev => prev ? ({ ...prev, monthlyContribution: Number(e.target.value) } as any) : null)}
                       className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm focus:ring-0 flex-1"
                     />
                     <span className="text-gray-400 text-sm">{getCurrencySymbol(editingConfig?.currency || 'NOK')}</span>
                  </div>
                </div>

                {/* Motivation */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <Label className="text-white text-sm mb-2 block">Motivation (Optional)</Label>
                                     <Input
                     value={editingConfig?.motivation || ''}
                     onChange={(e) => setEditingConfig(prev => prev ? ({ ...prev, motivation: e.target.value } as any) : null)}
                     className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm focus:ring-0"
                     placeholder="What drives you to save and improve?"
                   />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowConfigEdit(false)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfigSave}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 