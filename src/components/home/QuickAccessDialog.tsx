'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ExternalLink, Globe, ChevronRight } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import { 
  Github, Calendar, MessageSquare, Zap, Bot, Mail, 
  Music, Video, ShoppingCart, Camera, Code, Database,
  Gamepad2, Headphones, MapPin, Coffee, Book, Briefcase
} from 'lucide-react'

interface QuickAccessLink {
  id: string
  name: string
  url: string
  icon: string
  color: string
}

interface QuickAccessDialogProps {
  isOpen: boolean
  onClose: () => void
  onLinkAdded: (link: QuickAccessLink) => void
  editingLink?: QuickAccessLink | null
  onLinkUpdated?: (link: QuickAccessLink) => void
}

const iconOptions = [
  { name: 'Github', component: Github, value: 'Github' },
  { name: 'Calendar', component: Calendar, value: 'Calendar' },
  { name: 'Message', component: MessageSquare, value: 'MessageSquare' },
  { name: 'Zap', component: Zap, value: 'Zap' },
  { name: 'Bot', component: Bot, value: 'Bot' },
  { name: 'Mail', component: Mail, value: 'Mail' },
  { name: 'Music', component: Music, value: 'Music' },
  { name: 'Video', component: Video, value: 'Video' },
  { name: 'Shopping', component: ShoppingCart, value: 'ShoppingCart' },
  { name: 'Camera', component: Camera, value: 'Camera' },
  { name: 'Code', component: Code, value: 'Code' },
  { name: 'Database', component: Database, value: 'Database' },
  { name: 'Games', component: Gamepad2, value: 'Gamepad2' },
  { name: 'Audio', component: Headphones, value: 'Headphones' },
  { name: 'Location', component: MapPin, value: 'MapPin' },
  { name: 'Coffee', component: Coffee, value: 'Coffee' },
  { name: 'Book', component: Book, value: 'Book' },
  { name: 'Work', component: Briefcase, value: 'Briefcase' },
  { name: 'Globe', component: Globe, value: 'Globe' }
]

const colorOptions = [
  { name: 'Purple to Indigo', value: 'bg-gradient-to-br from-purple-500 to-indigo-600' },
  { name: 'Purple to Pink', value: 'bg-gradient-to-br from-purple-600 to-pink-600' },
  { name: 'Blue to Cyan', value: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { name: 'Green to Emerald', value: 'bg-gradient-to-br from-green-500 to-emerald-600' },
  { name: 'Orange to Red', value: 'bg-gradient-to-br from-orange-500 to-red-500' },
  { name: 'Blue to Indigo', value: 'bg-gradient-to-br from-blue-600 to-indigo-700' },
  { name: 'Yellow to Orange', value: 'bg-gradient-to-br from-yellow-500 to-orange-600' },
  { name: 'Pink to Purple', value: 'bg-gradient-to-br from-pink-500 to-purple-600' },
  { name: 'Cyan to Blue', value: 'bg-gradient-to-br from-cyan-400 to-blue-600' },
  { name: 'Emerald to Teal', value: 'bg-gradient-to-br from-emerald-500 to-teal-600' }
]

const categories = [
  'Development', 'Social', 'Productivity', 'Entertainment', 'Shopping', 'Education', 'Other'
]

export default function QuickAccessDialog({ isOpen, onClose, onLinkAdded, editingLink, onLinkUpdated }: QuickAccessDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    icon: 'Globe',
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    category: ''
  })

  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      icon: 'Globe',
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      category: ''
    })
    setShowIconPicker(false)
    setShowCategoryPicker(false)
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    } else if (editingLink) {
      // Pre-fill form with existing link data
      setFormData({
        name: editingLink.name,
        url: editingLink.url,
        icon: editingLink.icon,
        color: editingLink.color,
        category: ''
      })
    }
  }, [isOpen, editingLink])

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      return // Basic validation
    }

    // Ensure URL has protocol
    let processedUrl = formData.url.trim()
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl
    }

    if (editingLink) {
      // Update existing link
      const updatedLink: QuickAccessLink = {
        ...editingLink,
        name: formData.name.trim(),
        url: processedUrl,
        icon: formData.icon,
        color: formData.color
      }

      try {
        const links = await storage.load('quick-access-links') || []
        const updatedLinks = links.map((link: QuickAccessLink) => 
          link.id === editingLink.id ? updatedLink : link
        )
        await storage.save('quick-access-links', updatedLinks)
        
        if (onLinkUpdated) {
          onLinkUpdated(updatedLink)
        }
        onClose()
      } catch (error) {
        console.error('Error updating link:', error)
      }
    } else {
      // Create new link
      const newLink: QuickAccessLink = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        url: processedUrl,
        icon: formData.icon,
        color: formData.color
      }

      try {
        const existingLinks = await storage.load('quick-access-links') || []
        const updatedLinks = [...existingLinks, newLink]
        await storage.save('quick-access-links', updatedLinks)
        
        onLinkAdded(newLink)
        onClose()
      } catch (error) {
        console.error('Error saving link:', error)
      }
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconData = iconOptions.find(icon => icon.value === iconName)
    return iconData ? iconData.component : Globe
  }

  const IconComponent = getIconComponent(formData.icon)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-black/95 backdrop-blur-xl border border-white/20 text-white rounded-3xl p-0">
        
        {/* Header */}
        <DialogHeader className="p-4 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <DialogTitle className="text-lg font-bold">
              {editingLink ? 'Edit Link' : 'Add Quick Link'}
            </DialogTitle>
            <div className="w-12" /> {/* Spacer */}
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Icon and Name Section */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className={`w-12 h-12 ${formData.color} rounded-2xl flex items-center justify-center hover:opacity-80 transition-opacity shadow-lg`}
            >
              <IconComponent className="h-6 w-6 text-white" />
            </button>
            
            <div className="flex-1">
              <Input
                placeholder="Link Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-base rounded-lg"
              />
            </div>
          </div>

          {/* Icon Picker */}
          {showIconPicker && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="grid grid-cols-4 gap-2">
                {iconOptions.map((icon) => {
                  const Icon = icon.component
                  return (
                    <button
                      key={icon.value}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, icon: icon.value }))
                        setShowIconPicker(false)
                      }}
                      className={`p-2 flex flex-col items-center justify-center hover:bg-white/10 rounded-lg transition-colors ${
                        formData.icon === icon.value ? 'bg-white/20' : ''
                      }`}
                    >
                      <Icon className="h-5 w-5 text-white mb-1" />
                      <span className="text-xs text-gray-300">{icon.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Color Picker */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <Label className="text-white text-sm mb-2 block">Color Theme</Label>
            <div className="grid grid-cols-2 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    formData.color === color.value ? 'border-white' : 'border-transparent'
                  }`}
                >
                  <div className={`w-full h-8 ${color.value} rounded-lg`} />
                  <span className="text-xs text-gray-300 mt-1 block">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* URL Field */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <ExternalLink className="h-4 w-4 text-gray-400" />
              <Label className="text-white text-sm">URL</Label>
            </div>
            <Input
              type="url"
              placeholder="https://example.com or just example.com"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="bg-transparent border-none text-white placeholder:text-gray-400 text-sm focus:ring-0"
            />
          </div>

          {/* Category */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <button
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 text-gray-400">🏷️</div>
                <Label className="text-white text-sm">Category (Optional)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">{formData.category || 'None'}</span>
                <ChevronRight className="h-3 w-3 text-gray-400" />
              </div>
            </button>
            
            {showCategoryPicker && (
              <div className="mt-2 space-y-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, category }))
                      setShowCategoryPicker(false)
                    }}
                    className="w-full text-left px-2 py-1 text-white hover:bg-white/10 rounded-lg text-sm"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || !formData.url.trim()}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {editingLink ? 'Update Link' : 'Add Link'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 