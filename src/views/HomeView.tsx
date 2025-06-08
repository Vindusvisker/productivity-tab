import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import SearchBar from '@/components/productivity/SearchBar';

const HomeView: React.FC = () => {
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
    { name: 'Twitter', url: 'https://twitter.com', color: 'bg-blue-400' },
    { name: 'Discord', url: 'https://discord.com', color: 'bg-indigo-600' },
  ];

  const timeZones = [
    { name: 'Local', timezone: 'local' },
    { name: 'UTC', timezone: 'UTC' },
    { name: 'New York', timezone: 'America/New_York' },
    { name: 'London', timezone: 'Europe/London' },
  ];

  const getTimeForZone = (timezone: string) => {
    if (timezone === 'local') {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return new Date().toLocaleTimeString([], { 
      timeZone: timezone, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen pt-6 flex items-center justify-center">
      <div className="container mx-auto px-8 max-w-7xl">
        
        {/* Time Display */}
        <div className="text-center mb-8">
          <div className="text-8xl font-light text-white mb-2">
            {time}
          </div>
          <div className="text-lg text-white/80">
            {date}
          </div>
        </div>

        {/* Time Zones */}
        <div className="grid grid-cols-4 gap-6 mb-8 max-w-4xl mx-auto">
          {timeZones.map((zone) => (
            <Card key={zone.name} className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl hover:bg-white/10 transition-all">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-medium text-white mb-1">
                  {getTimeForZone(zone.timezone)}
                </div>
                <div className="text-sm text-white/70">
                  {zone.name}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-2xl">
            <SearchBar />
          </div>
        </div>

        {/* Quick Links */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl font-medium text-white mb-6 text-center">Quick Access</h3>
          <div className="grid grid-cols-8 gap-4">
            {quickLinks.map((link) => (
              <Card
                key={link.name}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-200 hover:scale-105 bg-white/5 backdrop-blur-md border border-white/10 shadow-xl hover:bg-white/10"
                onClick={() => window.open(link.url, '_blank')}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${link.color} rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <span className="text-white font-semibold text-lg">
                      {link.name.charAt(0)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-white/90 group-hover:text-white transition-colors">
                    {link.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeView; 