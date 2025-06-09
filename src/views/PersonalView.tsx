import { Card, CardContent } from '@/components/ui/card';
import ProfileHeader from '@/components/personal/ProfileHeader';
import ActiveMissions from '@/components/personal/ActiveMissions';
import JourneyHeatmap from '@/components/personal/JourneyHeatmap';
import AchievementWall from '@/components/personal/AchievementWall';
import WeeklyReflection from '@/components/personal/WeeklyReflection';

const PersonalView: React.FC = () => {
  return (
    <div className="h-screen pt-28 pb-16 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl h-full flex flex-col">
        
        {/* Top Row - Profile Header + Active Missions */}
        <div className="mb-6 flex-shrink-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Header - Slides in from LEFT */}
            <div className="opacity-0 animate-slide-in-left" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <ProfileHeader />
            </div>
            
            {/* Active Missions - Slides in from RIGHT */}
            <div className="opacity-0 animate-slide-in-right" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              <ActiveMissions />
            </div>
          </div>
        </div>

        {/* Main Content Grid - Flexible height */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          
          {/* Left Column - Journey Heatmap */}
          <div className="lg:col-span-1">
            {/* Title bounces in */}
            <h2 className="text-base font-bold text-white mb-2 flex items-center opacity-0 animate-bounce-in" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
              <span className="mr-2">📅</span>
              Journey Heatmap
            </h2>
            {/* Component fades and scales in */}
            <div className="opacity-0 animate-fade-in-scale" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
              <JourneyHeatmap className="h-full" />
            </div>
          </div>

          {/* Middle Column - Achievement Wall */}
          <div className="lg:col-span-1">
            {/* Title bounces in */}
            <h2 className="text-base font-bold text-white mb-2 flex items-center opacity-0 animate-bounce-in" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
              <span className="mr-2">🏆</span>
              Achievement Wall
            </h2>
            {/* Component fades and scales in */}
            <div className="opacity-0 animate-fade-in-scale" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
              <AchievementWall />
            </div>
          </div>

          {/* Right Column - Weekly Reflection */}
          <div className="lg:col-span-1">
            {/* Title bounces in */}
            <h2 className="text-base font-bold text-white mb-2 flex items-center opacity-0 animate-bounce-in" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
              <span className="mr-2">💭</span>
              Weekly Reflection
            </h2>
            {/* Component fades and scales in */}
            <div className="opacity-0 animate-fade-in-scale" style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}>
              <WeeklyReflection className="h-full" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PersonalView; 