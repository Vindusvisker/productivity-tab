import { Card, CardContent } from '@/components/ui/card';
import ProfileHeader from '@/components/personal/ProfileHeader';
import ActiveMissions from '@/components/personal/ActiveMissions';
import JourneyHeatmap from '@/components/personal/JourneyHeatmap';
import AchievementWall from '@/components/personal/AchievementWall';
import WeeklyReflection from '@/components/personal/WeeklyReflection';
import PersonalHelp from '@/components/PersonalHelp';
import { UserConfig } from '../types/UserConfig'

interface PersonalViewProps {
  userConfig?: UserConfig | null
}

const PersonalView: React.FC<PersonalViewProps> = ({ userConfig }) => {
  return (
    <div className="h-screen pt-28 pb-16 overflow-hidden relative">
      <div className="container mx-auto px-6 max-w-7xl h-full flex flex-col">
        
        {/* Help Button - Bottom right corner */}
        <div className="fixed bottom-6 right-6 z-20">
          <PersonalHelp />
        </div>
        
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
            {/* Component fades and scales in */}
            <div className="opacity-0 animate-fade-in-scale" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
              <JourneyHeatmap className="h-full" />
            </div>
          </div>

          {/* Middle Column - Achievement Wall */}
          <div className="lg:col-span-1">
            {/* Component fades and scales in */}
            <div className="opacity-0 animate-fade-in-scale" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
              <AchievementWall />
            </div>
          </div>

          {/* Right Column - Weekly Reflection */}
          <div className="lg:col-span-1">
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