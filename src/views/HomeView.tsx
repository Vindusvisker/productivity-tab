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
    <div className="min-h-screen pt-20 sm:pt-24 md:pt-28 lg:pt-32 flex items-center justify-center relative">
      
      {/* Help Button - Under theme button on smaller screens, bottom right on larger */}
      <div className="hidden 2xl:block fixed bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 z-20">
        <HomeHelp />
      </div>
      
      {/* Help Button - Under theme gallery button on smaller screens (1280x900 and under) */}
      <div className="block 2xl:hidden fixed top-14 sm:top-16 md:top-20 right-3 sm:right-4 md:right-6 z-20">
        <HomeHelp />
      </div>
      
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-full sm:max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
        
        {/* Top Row: Time Display & Habit Tracker */}
        <div className={`grid ${userConfig?.hasAddiction ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-10 lg:mb-12`}>
          {/* Time Display - Hero element with gentle fade */}
          <div className={`flex items-center justify-center ${!userConfig?.hasAddiction ? 'col-span-full' : ''}`}>
            <div className="text-center opacity-0 animate-gentle-fade" style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}>
              {/* Main time - responsive font sizes optimized for 1280x800 */}
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-light text-white mb-1 sm:mb-2 opacity-0 animate-smooth-fade-up" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
                {time}
              </div>
              {/* Date - responsive font sizes */}
              <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-white/80 opacity-0 animate-smooth-fade-up" style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}>
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