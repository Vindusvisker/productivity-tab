import HabitTracker from '@/components/productivity/HabitTracker';
import FocusTimer from '@/components/productivity/FocusTimer';
import WeeklyOverview from '@/components/productivity/WeeklyOverview';
import ProductivityHelp from '@/components/ProductivityHelp';
import { UserConfig } from '../types/UserConfig'

interface ProductivityViewProps {
  userConfig?: UserConfig | null
}

const ProductivityView: React.FC<ProductivityViewProps> = ({ userConfig }) => {
  return (
    <div className="min-h-screen pt-24 pb-8 mt-6 overflow-hidden relative">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Help Button - Under theme button on smaller screens, bottom right on larger */}
        <div className="hidden 2xl:block fixed bottom-6 right-6 z-20">
          <ProductivityHelp />
        </div>
        
        {/* Help Button - Under theme gallery button on smaller screens (1280x900 and under) */}
        <div className="block 2xl:hidden fixed top-14 sm:top-16 md:top-20 right-3 sm:right-4 md:right-6 z-20">
          <ProductivityHelp />
        </div>

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
              <WeeklyOverview userConfig={userConfig} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductivityView; 