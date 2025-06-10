import MoneySaved from '@/components/vision/MoneySaved';
import GoalTracker from '@/components/vision/GoalTracker';
import AffirmationWall from '@/components/vision/AffirmationWall';

const VisionView: React.FC = () => {
  return (
    <div className="h-screen pt-28 pb-16 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl h-full flex flex-col">
        
        {/* Main Content Grid - 3 Columns with Titles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          
          {/* Left Column - Savings Fund */}
          <div className="lg:col-span-1">
            {/* Title bounces in */}
            <h2 className="text-base font-bold text-white mb-4 flex items-center opacity-0 animate-bounce-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <span className="mr-2">💰</span>
              Savings Fund
            </h2>
            {/* Component slides in from left */}
            <div className="opacity-0 animate-slide-in-left h-full" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <MoneySaved />
            </div>
          </div>

          {/* Middle Column - Financial Goals */}
          <div className="lg:col-span-1">
            {/* Title bounces in */}
            <h2 className="text-base font-bold text-white mb-4 flex items-center opacity-0 animate-bounce-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <span className="mr-2">🎯</span>
              Financial Goals
            </h2>
            {/* Component fades and scales in */}
            <div className="opacity-0 animate-fade-in-scale h-full" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <GoalTracker />
            </div>
          </div>

          {/* Right Column - Daily Affirmations */}
          <div className="lg:col-span-1">
            {/* Title bounces in */}
            <h2 className="text-base font-bold text-white mb-4 flex items-center opacity-0 animate-bounce-in" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              <span className="mr-2">✨</span>
              Daily Affirmations
            </h2>
            {/* Component slides in from right */}
            <div className="opacity-0 animate-slide-in-right h-full" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
              <AffirmationWall />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VisionView; 