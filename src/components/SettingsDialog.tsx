'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Settings, Download, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

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
    </>
  )
} 