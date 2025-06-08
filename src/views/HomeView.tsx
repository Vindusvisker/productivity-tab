import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import SnusTracker from '@/components/home/SnusTracker';
import QuickAccess from '@/components/home/QuickAccess';

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

  return (
    <div className="min-h-screen pt-6 flex items-center justify-center">
      <div className="container mx-auto px-8 max-w-7xl">
        
        {/* Top Row: Time Display & Snus Tracker */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          {/* Time Display */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl font-light text-white mb-2">
                {time}
              </div>
              <div className="text-xl text-white/80">
                {date}
              </div>
            </div>
          </div>
          
          {/* Snus Tracker */}
          <SnusTracker />
        </div>

        {/* Bottom Row: Quick Access */}
        <QuickAccess />

      </div>
    </div>
  );
};

export default HomeView; 