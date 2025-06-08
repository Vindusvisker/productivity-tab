import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import ProfileHeader from '@/components/personal/ProfileHeader';
import ActiveMissions from '@/components/personal/ActiveMissions';
import JourneyHeatmap from '@/components/personal/JourneyHeatmap';
import AchievementWall from '@/components/personal/AchievementWall';

const PersonalView: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  return (
    <div className="h-screen pt-28 pb-16 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl h-full flex flex-col">
        
        {/* Top Row - Profile Header + Active Missions */}
        <div className="mb-6 flex-shrink-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Header */}
            <div>
              <ProfileHeader />
            </div>
            
            {/* Active Missions */}
            <div>
              <ActiveMissions />
            </div>
          </div>
        </div>

        {/* Main Content Grid - Flexible height */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          
          {/* Left Column - Journey Heatmap */}
          <div className="lg:col-span-1">
            <h2 className="text-base font-bold text-white mb-2 flex items-center">
              <span className="mr-2">📅</span>
              Journey Heatmap
            </h2>
            <JourneyHeatmap className="h-full" />
          </div>

          {/* Middle Column - Achievement Wall */}
          <div className="lg:col-span-1">
            <h2 className="text-base font-bold text-white mb-2 flex items-center">
              <span className="mr-2">🏆</span>
              Achievement Wall
            </h2>
            <AchievementWall />
          </div>

          {/* Right Column - Weekly Reflection (Coming Soon) */}
          <div className="lg:col-span-1">
            <h2 className="text-base font-bold text-white mb-2 flex items-center">
              <span className="mr-2">💭</span>
              Weekly Reflection
            </h2>
            <Card 
              className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden hover:border-white/20 transition-all cursor-pointer group hover:scale-105 h-full"
              onClick={() => setOpenDialog('reflection')}
            >
              <CardContent className="p-8 h-full flex flex-col justify-center items-center text-center">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  💭
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2">Weekly Reflection</h3>
                
                {/* Description */}
                <p className="text-sm text-gray-400 mb-4">Mood & energy trends</p>
                
                {/* Coming Soon Badge */}
                <div className="bg-white/10 border border-white/20 text-white text-sm px-4 py-2 rounded-full">
                  Coming Soon
                </div>
                
                {/* Click hint */}
                <div className="text-xs text-gray-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to preview
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Simple Dialog Overlay */}
        {openDialog && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpenDialog(null)}
          >
            <Card className="bg-black/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-3xl mb-4 mx-auto">
                    💭
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Weekly Reflection</h2>
                  <p className="text-gray-400 mb-6">Mood & energy trends</p>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-gray-300 mb-4">
                      Weekly mood and energy tracking with visual trends. 
                      Optional daily reflections to understand your patterns.
                    </p>
                    <div className="text-sm text-gray-500">
                      Features: Mood charts, energy levels, weekly insights
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setOpenDialog(null)}
                    className="mt-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2 rounded-xl transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default PersonalView; 