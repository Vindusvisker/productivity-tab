'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('search-input') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // Check if it looks like a URL
    if (searchQuery.includes('.') && !searchQuery.includes(' ')) {
      // Add protocol if missing
      const url = searchQuery.startsWith('http') 
        ? searchQuery 
        : `https://${searchQuery}`
      window.open(url, '_blank')
    } else {
      // Search Google
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank')
    }
    
    setSearchQuery('')
  }

  return (
    <Card className="w-full bg-white/10 backdrop-blur-md border-0 shadow-xl">
      <CardContent className="p-6">
        <form onSubmit={handleSearch} className="flex space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
            <Input
              id="search-input"
              type="text"
              placeholder="Search Google or type a URL... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg bg-white/20 border-white/20 text-white placeholder:text-white/60 focus:border-orange-400 focus:ring-orange-400/30 rounded-xl backdrop-blur-sm"
            />
          </div>
          <Button 
            type="submit" 
            size="lg" 
            className="px-8 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl"
          >
            Search
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 
