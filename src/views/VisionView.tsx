import MoneySaved from '@/components/vision/MoneySaved';
import GoalTracker from '@/components/vision/GoalTracker';
import AffirmationWall from '@/components/vision/AffirmationWall';
import VisionHelp from '@/components/VisionHelp';
import { UserConfig } from '../types/UserConfig'

interface VisionViewProps {
  userConfig?: UserConfig | null
}

const VisionView: React.FC<VisionViewProps> = ({ userConfig }) => {
  return (
    <div className="min-h-screen 2xl:h-screen pt-28 pb-16 overflow-auto 2xl:overflow-hidden relative">
      <div className="container mx-auto px-6 max-w-7xl h-full flex flex-col">
        
        {/* Help Button - Under theme button on smaller screens, bottom right on larger */}
        <div className="hidden 2xl:block fixed bottom-6 right-6 z-20">
          <VisionHelp />
        </div>
        
        {/* Help Button - Under theme gallery button on smaller screens (1280x900 and under) */}
        <div className="block 2xl:hidden fixed top-14 sm:top-16 md:top-20 right-3 sm:right-4 md:right-6 z-20">
          <VisionHelp />
        </div>
        
        {/* Main Content Grid - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          
          {/* Left Column - Affirmations + Savings Fund (Stacked) */}
          <div className="lg:col-span-1 flex flex-col space-y-6 min-h-0">
            
            {/* Daily Affirmations */}
            <div className="flex-shrink-0">
              <div className="opacity-0 animate-slide-in-left" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                <AffirmationWall />
              </div>
            </div>

            {/* Savings Fund */}
            <div className="flex-1 min-h-0">
              <div className="opacity-0 animate-slide-in-left" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
                <MoneySaved userConfig={userConfig} />
              </div>
            </div>

          </div>

          {/* Right Column - Financial Goals (Full Height) */}
          <div className="lg:col-span-1 min-h-0">
            <div className="opacity-0 animate-slide-in-right" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
              <GoalTracker />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VisionView; 