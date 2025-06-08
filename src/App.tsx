import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import GreetingMessage from '@/components/productivity/GreetingMessage';
import SearchBar from '@/components/productivity/SearchBar';
import HabitTracker from '@/components/productivity/HabitTracker';
import DailyGoals from '@/components/productivity/DailyGoals';

export default function App() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const quickLinks = [
    { name: 'Gmail', url: 'https://gmail.com', color: 'bg-red-500' },
    { name: 'GitHub', url: 'https://github.com', color: 'bg-gray-800' },
    { name: 'Trale', url: 'https://github.com/Vindusvisker/productivity-tab', color: 'bg-purple-600' },
    { name: 'LinkedIn', url: 'https://linkedin.com', color: 'bg-blue-700' },
    { name: 'YouTube', url: 'https://youtube.com', color: 'bg-red-600' },
    { name: 'Reddit', url: 'https://reddit.com', color: 'bg-orange-600' },
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-auto">
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          
          {/* Header with Date/Time */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2 text-gray-400">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">{date}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-blue-400" />
              <span className="text-2xl font-bold text-white">{time}</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="space-y-8">
            
            {/* Greeting Section */}
            <GreetingMessage />

            {/* Search Bar */}
            <div className="flex justify-center">
              <SearchBar />
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-6">
                <HabitTracker />
                <DailyGoals />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                
                {/* Quick Links */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {quickLinks.map((link) => (
                        <Card
                          key={link.name}
                          className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gray-700/50 border-gray-600 hover:border-gray-500"
                          onClick={() => window.open(link.url, '_blank')}
                        >
                          <CardContent className="p-4 text-center">
                            <div className={`w-10 h-10 ${link.color} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                              <span className="text-white font-bold text-sm">
                                {link.name.charAt(0)}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-200">{link.name}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Overview */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Today&apos;s Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Focus Mode</span>
                        <span className="text-green-400 text-sm font-medium">Active 🎯</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Productivity Level</span>
                        <span className="text-blue-400 text-sm font-medium">Rising 📈</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Energy Level</span>
                        <span className="text-purple-400 text-sm font-medium">High ⚡</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
} 