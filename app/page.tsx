'use client'

import { useState, useEffect } from 'react'
import { Clock, Calendar, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function NewTabPage() {
  const [time, setTime] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      setDate(now.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }))
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank')
      setSearchQuery('')
    }
  }

  const quickLinks = [
    { name: 'Gmail', url: 'https://gmail.com', color: 'bg-red-500' },
    { name: 'YouTube', url: 'https://youtube.com', color: 'bg-red-600' },
    { name: 'GitHub', url: 'https://github.com', color: 'bg-gray-800' },
    { name: 'Twitter', url: 'https://twitter.com', color: 'bg-blue-500' },
    { name: 'LinkedIn', url: 'https://linkedin.com', color: 'bg-blue-700' },
    { name: 'Reddit', url: 'https://reddit.com', color: 'bg-orange-600' },
  ]

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-auto">
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center space-x-2 text-gray-400">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">{date}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col items-center space-y-12">
            {/* Time Display */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Clock className="h-8 w-8 text-blue-400" />
                <h1 className="text-6xl font-bold text-white">{time}</h1>
              </div>
              <p className="text-xl text-gray-300">Good day! Ready to be productive?</p>
            </div>

            {/* Search Bar */}
            <Card className="w-full max-w-2xl bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="flex space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search Google or type a URL..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-lg bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                    />
                  </div>
                  <Button type="submit" size="lg" className="px-8 bg-blue-600 hover:bg-blue-700">
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="w-full max-w-4xl">
              <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                Quick Links
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickLinks.map((link) => (
                  <Card
                    key={link.name}
                    className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gray-800/50 border-gray-700 hover:border-gray-600"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 ${link.color} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">
                          {link.name.charAt(0)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-200">{link.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 