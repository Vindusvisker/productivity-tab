import SnusImpactTracker from '@/components/financial/SnusImpactTracker';
import SubscriptionTracker from '@/components/financial/SubscriptionTracker';
import FinancialHelp from '@/components/FinancialHelp';
import { UserConfig } from '../types/UserConfig'

interface FinancialViewProps {
  userConfig?: UserConfig | null
}

const FinancialView: React.FC<FinancialViewProps> = ({ userConfig }) => {
  return (
    <div className="h-screen pt-28 pb-16 overflow-hidden relative">
      <div className="container mx-auto px-6 max-w-7xl h-full flex flex-col">
        
        {/* Help Button - Under theme button on smaller screens, bottom right on larger */}
        <div className="hidden 2xl:block fixed bottom-6 right-6 z-20">
          <FinancialHelp />
        </div>
        
        {/* Help Button - Under theme gallery button on smaller screens (1280x900 and under) */}
        <div className="block 2xl:hidden fixed top-14 sm:top-16 md:top-20 right-3 sm:right-4 md:right-6 z-20">
          <FinancialHelp />
        </div>
        
        {/* Main Content Grid - 2 Columns side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 mb-6">
          
          {/* Left Column - Habit Impact Tracker */}
          <div>
            {/* Component slides in from left */}
            <div className="opacity-0 animate-slide-in-left h-[calc(100vh-12rem)]" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <SnusImpactTracker userConfig={userConfig} />
            </div>
          </div>

          {/* Right Column - Subscription Tracker */}
          <div>
            {/* Component slides in from right */}
            <div className="opacity-0 animate-slide-in-right h-[calc(100vh-12rem)]" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <SubscriptionTracker userConfig={userConfig} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FinancialView; 