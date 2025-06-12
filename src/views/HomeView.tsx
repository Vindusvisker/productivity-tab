import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import SnusTracker from '@/components/home/SnusTracker';
import QuickAccess from '@/components/home/QuickAccess';
import HomeHelp from '@/components/HomeHelp';
import { UserConfig } from '../types/UserConfig'

interface HomeViewProps {
  userConfig?: UserConfig | null
}

const HomeView: React.FC<HomeViewProps> = ({ userConfig }) => {
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

  return (
    <div className="min-h-screen pt-6 flex items-center justify-center relative">
      
      {/* Help Button - Bottom right corner */}
      <div className="fixed bottom-6 right-6 z-20">
        <HomeHelp />
      </div>
      
      <div className="container mx-auto px-8 max-w-7xl">
        
        {/* Top Row: Time Display & Habit Tracker */}
        <div className={`grid ${userConfig?.hasAddiction ? 'grid-cols-2' : 'grid-cols-1'} gap-8 mb-12`}>
          {/* Time Display - Hero element with gentle fade */}
          <div className={`flex items-center justify-center ${!userConfig?.hasAddiction ? 'col-span-2' : ''}`}>
            <div className="text-center opacity-0 animate-gentle-fade" style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}>
              {/* Main time - smooth fade up */}
              <div className="text-8xl font-light text-white mb-2 opacity-0 animate-smooth-fade-up" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
                {time}
              </div>
              {/* Date - subtle slide up */}
              <div className="text-xl text-white/80 opacity-0 animate-smooth-fade-up" style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}>
                {date}
              </div>
            </div>
          </div>
          
          {/* Habit Tracker - iOS slide up from right side */}
          {userConfig?.hasAddiction && (
            <div className="opacity-0 animate-ios-slide-up" style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}>
              <SnusTracker userConfig={userConfig} />
            </div>
          )}
        </div>

        {/* Bottom Row: Quick Access - Final elegant entrance */}
        <div className="opacity-0 animate-ios-slide-up" style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}>
          <QuickAccess />
        </div>

      </div>
    </div>
  );
};

export default HomeView; 