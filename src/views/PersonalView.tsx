import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import ProfileHeader from '@/components/personal/ProfileHeader';
import ActiveMissions from '@/components/personal/ActiveMissions';
import PowerGrid from '@/components/personal/PowerGrid';
import JourneyHeatmap from '@/components/personal/JourneyHeatmap';

const PersonalView: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const previewCards = [
    {
      id: 'achievements',
      title: 'Achievement Wall',
      icon: '🏆',
      description: 'Badges & rewards',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'reflection',
      title: 'Weekly Reflection',
      icon: '💭',
      description: 'Mood & energy trends',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="h-screen pt-28 pb-16 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl h-full flex flex-col">
        
        {/* Top Row - Profile Header + Active Missions */}
        <div className="mb-4 flex-shrink-0">
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
          
          {/* Left Column - Power Stats */}
          <div className="lg:col-span-1">
            <h2 className="text-base font-bold text-white mb-2 flex items-center">
              <span className="mr-2">⚡</span>
              Power Stats
            </h2>
            <PowerGrid />
          </div>

          {/* Middle Column - Journey Heatmap */}
          <div className="lg:col-span-1">
            <h2 className="text-base font-bold text-white mb-2 flex items-center">
              <span className="mr-2">📅</span>
              Journey Heatmap
            </h2>
            <JourneyHeatmap className="h-full" />
          </div>

          {/* Right Column - Preview Cards */}
          <div className="lg:col-span-1">
            <h2 className="text-base font-bold text-white mb-2 flex items-center">
              <span className="mr-2">🚀</span>
              Coming Soon
            </h2>
            <div className="grid grid-cols-1 gap-3 h-full">
              {previewCards.map((card) => (
                <Card 
                  key={card.id}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden hover:border-white/20 transition-all cursor-pointer group hover:scale-105"
                  onClick={() => setOpenDialog(card.id)}
                >
                  <CardContent className="p-4 h-full flex flex-col justify-center items-center text-center">
                    {/* Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-2xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                      {card.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-base font-bold text-white mb-1">{card.title}</h3>
                    
                    {/* Description */}
                    <p className="text-xs text-gray-400 mb-3">{card.description}</p>
                    
                    {/* Coming Soon Badge */}
                    <div className="bg-white/10 border border-white/20 text-white text-xs px-3 py-1 rounded-full">
                      Coming Soon
                    </div>
                    
                    {/* Click hint */}
                    <div className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to preview
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  {/* Find the card data */}
                  {(() => {
                    const card = previewCards.find(c => c.id === openDialog)
                    return (
                      <>
                        <div className={`w-16 h-16 bg-gradient-to-r ${card?.color} rounded-3xl flex items-center justify-center text-3xl mb-4 mx-auto`}>
                          {card?.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{card?.title}</h2>
                        <p className="text-gray-400 mb-6">{card?.description}</p>
                        
                        {/* Preview content based on type */}                        
                        {openDialog === 'achievements' && (
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <div className="text-4xl mb-4">🎖️</div>
                            <p className="text-gray-300 mb-4">
                              Unlock badges and achievements as you reach milestones. 
                              From "First Week Warrior" to "Productivity Legend".
                            </p>
                            <div className="text-sm text-gray-500">
                              Features: Badge showcase, progress tracking, milestone rewards
                            </div>
                          </div>
                        )}
                        
                        {openDialog === 'reflection' && (
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
                        )}
                        
                        <button 
                          onClick={() => setOpenDialog(null)}
                          className="mt-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2 rounded-xl transition-colors"
                        >
                          Close Preview
                        </button>
                      </>
                    )
                  })()}
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