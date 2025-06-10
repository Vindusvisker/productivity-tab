import SnusImpactTracker from '@/components/financial/SnusImpactTracker';
import SubscriptionTracker from '@/components/financial/SubscriptionTracker';

const FinancialView: React.FC = () => {
  return (
    <div className="h-screen pt-28 pb-16 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl h-full flex flex-col">
        
        {/* Main Content Grid - 2 Columns side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 mb-6">
          
          {/* Left Column - Snus Impact Tracker */}
          <div>
            {/* Component slides in from left */}
            <div className="opacity-0 animate-slide-in-left h-[calc(100vh-12rem)]" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <SnusImpactTracker />
            </div>
          </div>

          {/* Right Column - Subscription Tracker */}
          <div>
            {/* Component slides in from right */}
            <div className="opacity-0 animate-slide-in-right h-[calc(100vh-12rem)]" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <SubscriptionTracker />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FinancialView; 