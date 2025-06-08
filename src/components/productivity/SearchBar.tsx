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
    <Card className="w-full max-w-2xl bg-gray-800/50 border-gray-700">
      <CardContent className="p-6">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              id="search-input"
              type="text"
              placeholder="Search Google or type a URL... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
            />
          </div>
          <Button 
            type="submit" 
            size="lg" 
            className="px-8 bg-blue-600 hover:bg-blue-700"
          >
            Search
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press ⌘K to focus • Type URLs directly • Search anything on Google
        </p>
      </CardContent>
    </Card>
  )
} 