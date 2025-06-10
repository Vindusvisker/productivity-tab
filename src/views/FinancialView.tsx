import SubscriptionTracker from '@/components/financial/SubscriptionTracker';
import SnusImpactTracker from '@/components/financial/SnusImpactTracker';
import MoneyPulse from '@/components/financial/MoneyPulse';

const FinancialView: React.FC = () => {
  return (
    <div className="h-screen pt-28 pb-16 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl h-full flex flex-col">
        
        {/* Main Content Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 mb-6">
          
          {/* Left Column - Subscription Tracker */}
          <div className="lg:col-span-1">
            {/* Component slides in from left */}
            <div className="opacity-0 animate-slide-in-left h-[calc(100vh-12rem)]" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <SubscriptionTracker />
            </div>
          </div>

          {/* Middle Column - Snus Impact Tracker */}
          <div className="lg:col-span-1">
            {/* Component fades and scales in */}
            <div className="opacity-0 animate-fade-in-scale h-[calc(100vh-12rem)]" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <SnusImpactTracker />
            </div>
          </div>

          {/* Right Column - Money Pulse */}
          <div className="lg:col-span-1">
            {/* Component slides in from right */}
            <div className="opacity-0 animate-slide-in-right h-[calc(100vh-12rem)]" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
              <MoneyPulse />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FinancialView; 