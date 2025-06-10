import SubscriptionTracker from '@/components/financial/SubscriptionTracker';
import ExpenseOverview from '@/components/financial/ExpenseOverview';
import BudgetPlanner from '@/components/financial/BudgetPlanner';

const FinancialView: React.FC = () => {
  return (
    <div className="h-screen pt-28 pb-16 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl h-full flex flex-col">
        
        {/* Main Content Grid - 3 Columns with Titles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          
          {/* Left Column - Subscription Tracker */}
          <div className="lg:col-span-1">
            {/* Component slides in from left */}
            <div className="opacity-0 animate-slide-in-left h-full" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <SubscriptionTracker />
            </div>
          </div>

          {/* Middle Column - Expense Overview */}
          <div className="lg:col-span-1">
            {/* Component fades and scales in */}
            <div className="opacity-0 animate-fade-in-scale h-full" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <ExpenseOverview />
            </div>
          </div>

          {/* Right Column - Budget Planner */}
          <div className="lg:col-span-1">
            {/* Component slides in from right */}
            <div className="opacity-0 animate-slide-in-right h-full" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
              <BudgetPlanner />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FinancialView; 