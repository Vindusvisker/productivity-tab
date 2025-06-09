import HabitTracker from '@/components/productivity/HabitTracker';
import FocusTimer from '@/components/productivity/FocusTimer';
import WeeklyOverview from '@/components/productivity/WeeklyOverview';

const ProductivityView: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-8 mt-6 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Main Productivity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            {/* HabitTracker - First to appear */}
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <HabitTracker />
            </div>
            
            {/* FocusTimer - Second to appear */}
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <FocusTimer />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* WeeklyOverview - Third to appear */}
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              <WeeklyOverview />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductivityView; 