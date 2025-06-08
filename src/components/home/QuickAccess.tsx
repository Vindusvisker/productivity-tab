'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, Github, Calendar, MessageSquare, Zap, Bot } from 'lucide-react'

export default function QuickAccess() {
  const quickLinks = [
    { 
      name: 'Trale Extension', 
      url: 'https://github.com/BredeYabo/trale-extension/tree/dev', 
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      icon: Github
    },
    { 
      name: 'Trale Main', 
      url: 'https://github.com/BredeYabo/trale-full', 
      color: 'bg-gradient-to-br from-purple-600 to-pink-600',
      icon: Github
    },
    { 
      name: 'Daily.dev', 
      url: 'https://app.daily.dev/', 
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      icon: Zap
    },
    { 
      name: 'ChatGPT', 
      url: 'https://chatgpt.com/', 
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      icon: MessageSquare
    },
    { 
      name: 'Claude AI', 
      url: 'https://claude.ai/new', 
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      icon: Bot
    },
    { 
      name: 'Calendar', 
      url: 'https://calendar.google.com/calendar/u/0/r/week?pli=1', 
      color: 'bg-gradient-to-br from-blue-600 to-indigo-700',
      icon: Calendar
    },
  ];

  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
      <CardContent className="p-8">
        <h3 className="text-2xl font-semibold text-white mb-6 text-center">Quick Access</h3>
        <div className="grid grid-cols-3 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <div
                key={link.name}
                className="group cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => window.open(link.url, '_blank')}
              >
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-200 hover:shadow-xl">
                  <div className={`w-16 h-16 ${link.color} rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                    {link.name}
                  </p>
                  <ExternalLink className="h-3 w-3 text-white/50 mx-auto mt-2 group-hover:text-white/70 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
} 