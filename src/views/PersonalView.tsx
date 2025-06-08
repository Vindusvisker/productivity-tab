import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Flame, Zap, Target, Calendar, Award, TrendingUp } from 'lucide-react';

const PersonalView: React.FC = () => {
  const currentLevel = 12;
  const currentXP = 2350;
  const nextLevelXP = 3000;
  const xpProgress = (currentXP / nextLevelXP) * 100;

  const achievements = [
    { id: 1, name: 'Early Bird', description: 'Wake up before 7 AM for 7 days', icon: '🌅', unlocked: true },
    { id: 2, name: 'Habit Master', description: 'Complete 50 habits', icon: '🎯', unlocked: true },
    { id: 3, name: 'Focus Zone', description: '4+ hours of focus time', icon: '🧠', unlocked: true },
    { id: 4, name: 'Streak Lord', description: '30-day streak', icon: '🔥', unlocked: false },
    { id: 5, name: 'Goal Crusher', description: 'Complete 10 goals in a week', icon: '💪', unlocked: false },
    { id: 6, name: 'Zen Master', description: 'Meditate for 100 days', icon: '🧘', unlocked: false },
  ];

  const weeklyMood = [
    { day: 'Mon', mood: 4, energy: 3 },
    { day: 'Tue', mood: 5, energy: 4 },
    { day: 'Wed', mood: 3, energy: 3 },
    { day: 'Thu', mood: 5, energy: 5 },
    { day: 'Fri', mood: 4, energy: 4 },
    { day: 'Sat', mood: 5, energy: 4 },
    { day: 'Sun', mood: 4, energy: 3 },
  ];

  const getMoodEmoji = (mood: number) => {
    const moods = ['😫', '😔', '😐', '😊', '😄'];
    return moods[mood - 1] || '😐';
  };

  const getEnergyColor = (energy: number) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];
    return colors[energy - 1] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen pt-24 pb-8">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 mx-auto">
              {currentLevel}
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
              <Star className="h-4 w-4 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Level {currentLevel} Productivity Master</h2>
          <div className="flex items-center justify-center space-x-4 text-gray-400">
            <span className="flex items-center">
              <Zap className="h-4 w-4 mr-1 text-yellow-400" />
              {currentXP} XP
            </span>
            <span className="flex items-center">
              <Flame className="h-4 w-4 mr-1 text-orange-400" />
              7 day streak
            </span>
          </div>
        </div>

        {/* XP Progress */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Progress to Level {currentLevel + 1}</span>
              <span className="text-blue-400">{currentXP} / {nextLevelXP} XP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 relative overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 relative"
                style={{ width: `${xpProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">{nextLevelXP - currentXP} XP until next level</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Achievements */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                  Achievements
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg border transition-all ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                          : 'bg-gray-700/50 border-gray-600 opacity-60'
                      }`}
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <div className="text-sm font-medium text-white mb-1">{achievement.name}</div>
                      <div className="text-xs text-gray-400">{achievement.description}</div>
                      {achievement.unlocked && (
                        <div className="flex items-center mt-2">
                          <Award className="h-3 w-3 text-yellow-400 mr-1" />
                          <span className="text-xs text-yellow-400">Unlocked!</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Challenge */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-400" />
                  Weekly Challenge
                </h3>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">Complete 35 Habits</span>
                    <span className="text-purple-400">23/35</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-2/3"></div>
                  </div>
                  <div className="text-sm text-gray-300">Reward: +500 XP + Bonus Badge 🏆</div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Mood & Energy Tracker */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                  Weekly Insights
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-300 mb-2">Mood & Energy</div>
                    <div className="grid grid-cols-7 gap-2">
                      {weeklyMood.map((day, index) => (
                        <div key={index} className="text-center">
                          <div className="text-xs text-gray-400 mb-1">{day.day}</div>
                          <div className="text-lg mb-1">{getMoodEmoji(day.mood)}</div>
                          <div className={`h-2 rounded-full ${getEnergyColor(day.energy)}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4 text-center">
                  <Flame className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-400 mb-1">7</div>
                  <div className="text-xs text-gray-400">Current Streak</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-400 mb-1">23</div>
                  <div className="text-xs text-gray-400">Total Badges</div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Reflection */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                  Daily Reflection
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-300 block mb-2">How was your day? (1-5)</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          className="w-8 h-8 rounded-full bg-gray-700 hover:bg-blue-600 transition-colors flex items-center justify-center text-sm"
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 block mb-2">Energy Level?</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-4 h-6 rounded ${getEnergyColor(level)} opacity-60 hover:opacity-100 cursor-pointer`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PersonalView; 