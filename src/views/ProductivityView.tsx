import { Card, CardContent } from '@/components/ui/card';
import GreetingMessage from '@/components/productivity/GreetingMessage';
import HabitTracker from '@/components/productivity/HabitTracker';
import DailyGoals from '@/components/productivity/DailyGoals';

const ProductivityView: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-8">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Greeting Section */}
        <div className="mb-8">
          <GreetingMessage />
        </div>

        {/* Main Productivity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            <HabitTracker />
            <DailyGoals />
          </div>

          {/* Right Column - Stats & Overview */}
          <div className="space-y-6">
            
            {/* Today's Overview */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Today&apos;s Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Focus Mode</span>
                    <span className="text-green-400 text-sm font-medium">Active 🎯</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Productivity Level</span>
                    <span className="text-blue-400 text-sm font-medium">Rising 📈</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Energy Level</span>
                    <span className="text-purple-400 text-sm font-medium">High ⚡</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Weekly Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Habits Completed</span>
                      <span className="text-blue-400">23/35</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-2/3"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Goals Achieved</span>
                      <span className="text-green-400">8/12</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-2/3"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Focus Time</span>
                      <span className="text-purple-400">4.5h / 6h</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">7</div>
                  <div className="text-xs text-gray-400">Day Streak</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">89%</div>
                  <div className="text-xs text-gray-400">Success Rate</div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductivityView; 