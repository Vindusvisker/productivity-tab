'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, Plus, MoreHorizontal, Edit2, Trash2, Globe, ChevronLeft, ChevronRight } from 'lucide-react'
import { storage } from '@/lib/chrome-storage'
import QuickAccessDialog from './QuickAccessDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

// Default links to migrate from hardcoded version
const defaultLinks: Omit<QuickAccessLink, 'id'>[] = [
  { 
    name: 'Gmail', 
    url: 'https://https://mail.google.com/mail/u/0/#inbox', 
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    icon: 'Mail'
  },
  { 
    name: 'GitHub', 
    url: 'https://github.com/', 
    color: 'bg-gradient-to-br from-purple-600 to-pink-600',
    icon: 'Github'
  },
  { 
    name: 'Daily.dev', 
    url: 'https://app.daily.dev/', 
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    icon: 'Zap'
  },
  { 
    name: 'ChatGPT', 
    url: 'https://chatgpt.com/', 
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    icon: 'MessageSquare'
  },
  { 
    name: 'Claude AI', 
    url: 'https://claude.ai/new', 
    color: 'bg-gradient-to-br from-orange-500 to-red-500',
    icon: 'Bot'
  },
  { 
    name: 'Calendar', 
    url: 'https://calendar.google.com/calendar/u/0/r/week?pli=1', 
    color: 'bg-gradient-to-br from-blue-600 to-indigo-700',
    icon: 'Calendar'
  },
]

const LINKS_PER_PAGE = 6 // 3x2 grid

export default function QuickAccess() {
  const [quickLinks, setQuickLinks] = useState<QuickAccessLink[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<QuickAccessLink | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  useEffect(() => {
    loadQuickLinks()
  }, [])

  const loadQuickLinks = async () => {
    try {
      const storedLinks = await storage.load('quick-access-links')
      
      if (!storedLinks || storedLinks.length === 0) {
        // First time loading - initialize with default links
        const initialLinks: QuickAccessLink[] = defaultLinks.map((link, index) => ({
          ...link,
          id: `default-${index}`
        }))
        
        await storage.save('quick-access-links', initialLinks)
        setQuickLinks(initialLinks)
      } else {
        setQuickLinks(storedLinks)
      }
    } catch (error) {
      console.error('Error loading quick links:', error)
      // Fallback to default links if storage fails
      const fallbackLinks: QuickAccessLink[] = defaultLinks.map((link, index) => ({
        ...link,
        id: `fallback-${index}`
      }))
      setQuickLinks(fallbackLinks)
    }
  }

  const handleLinkAdded = (newLink: QuickAccessLink) => {
    setQuickLinks(prev => [...prev, newLink])
  }

  const handleLinkUpdated = (updatedLink: QuickAccessLink) => {
    setQuickLinks(prev => prev.map(link => 
      link.id === updatedLink.id ? updatedLink : link
    ))
  }

  const handleEditLink = (link: QuickAccessLink) => {
    setEditingLink(link)
    setIsDialogOpen(true)
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      const updatedLinks = quickLinks.filter(link => link.id !== linkId)
      await storage.save('quick-access-links', updatedLinks)
      setQuickLinks(updatedLinks)
      
      // Adjust current page if necessary
      const totalPages = Math.ceil(updatedLinks.length / LINKS_PER_PAGE)
      if (currentPage >= totalPages && totalPages > 0) {
        setCurrentPage(totalPages - 1)
      }
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }

  const handleAddNew = () => {
    setEditingLink(null)
    setIsDialogOpen(true)
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      Github, Calendar, MessageSquare, Zap, Bot, Mail,
      Music, Video, ShoppingCart, Camera, Code, Database,
      Gamepad2, Headphones, MapPin, Coffee, Book, Briefcase,
      Globe
    }
    return iconMap[iconName] || Globe
  }

  // Pagination logic
  const totalPages = Math.ceil(quickLinks.length / LINKS_PER_PAGE)
  const startIndex = currentPage * LINKS_PER_PAGE
  const endIndex = startIndex + LINKS_PER_PAGE
  const currentLinks = quickLinks.slice(startIndex, endIndex)
  
  // Fill remaining slots with empty slots for consistent layout
  const remainingSlots = LINKS_PER_PAGE - currentLinks.length
  const canAddMore = quickLinks.length < 18 // Max 18 links (3 pages)

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <>
      <Card className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-white">Quick Access</h3>
            <div className="flex items-center space-x-2">
              {/* Pagination indicators */}
              {totalPages > 1 && (
                <div className="flex items-center space-x-2 mr-4">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 text-white/70" />
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentPage 
                            ? 'bg-white' 
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages - 1}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4 text-white/70" />
                  </button>
                </div>
              )}
              
              <button
                onClick={handleAddNew}
                disabled={!canAddMore}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Fixed height grid container */}
          <div className="h-[300px]"> {/* Fixed height to prevent expansion */}
            <div className="grid grid-cols-3 grid-rows-2 gap-6 h-full">
              {currentLinks.map((link) => {
                const IconComponent = getIconComponent(link.icon)
                const isDropdownOpen = openDropdownId === link.id
                return (
                  <div
                    key={link.id}
                    className={`group cursor-pointer transition-all duration-200 hover:scale-105 relative ${
                      isDropdownOpen ? 'z-[100]' : 'z-0'
                    }`}
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-all duration-200 hover:shadow-xl h-full flex flex-col justify-center relative">
                      <div 
                        className={`w-12 h-12 ${link.color} rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors mb-2 line-clamp-1">
                        {link.name}
                      </p>
                      <div className="flex items-center justify-center space-x-2">
                        <ExternalLink className="h-3 w-3 text-white/50 group-hover:text-white/70 transition-colors" />
                        
                        {/* Options Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger 
                            className="p-1 hover:bg-white/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenDropdownId(isDropdownOpen ? null : link.id)
                            }}
                          >
                            <MoreHorizontal className="h-3 w-3 text-white/50 hover:text-white/70" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            className="bg-black/90 backdrop-blur-xl border border-white/20 text-white"
                            onClose={() => setOpenDropdownId(null)}
                          >
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenDropdownId(null)
                                handleEditLink(link)
                              }}
                              className="hover:bg-white/10 cursor-pointer"
                            >
                              <Edit2 className="h-3 w-3 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenDropdownId(null)
                                handleDeleteLink(link.id)
                              }}
                              className="hover:bg-white/10 cursor-pointer text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Add New Link Card - Only show if there's space and can add more */}
              {remainingSlots > 0 && canAddMore && (
                <div
                  onClick={handleAddNew}
                  className="group cursor-pointer transition-all duration-200 hover:scale-105"
                >
                  <div className="bg-white/5 backdrop-blur-md border-2 border-dashed border-white/20 rounded-2xl p-4 text-center hover:bg-white/10 hover:border-white/40 transition-all duration-200 h-full flex flex-col justify-center">
                    <div className="w-12 h-12 bg-white/10 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Plus className="h-6 w-6 text-white/60 group-hover:text-white/80" />
                    </div>
                    <p className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors">
                      Add Link
                    </p>
                  </div>
                </div>
              )}

              {/* Empty slots to maintain grid structure */}
              {Array.from({ length: remainingSlots - (canAddMore ? 1 : 0) }, (_, i) => (
                <div key={`empty-${i}`} className="invisible" />
              ))}
            </div>
          </div>

          {/* Page indicator text */}
          {totalPages > 1 && (
            <div className="text-center mt-4">
              <span className="text-xs text-white/40">
                Page {currentPage + 1} of {totalPages} • {quickLinks.length} links
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <QuickAccessDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onLinkAdded={handleLinkAdded}
        editingLink={editingLink}
        onLinkUpdated={handleLinkUpdated}
      />
    </>
  )
} 