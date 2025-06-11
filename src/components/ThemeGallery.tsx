import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ClaimButton } from '@/components/ui/claim-button';
import { X, Lock, Crown, Star, Sparkles, Zap, Gift, CheckCircle, AlertCircle } from 'lucide-react';
import { storage } from '@/lib/chrome-storage';

interface Theme {
  id: string;
  name: string;
  description: string;
  rarity: string;
  rarityLabel: string;
  levelRequired: number;
  unlockMessage: string;
  backgroundColor: string;
  gradientSpots: string[];
  grainOpacity: number;
  grainColors: string;
}

interface ThemeGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  themes: Record<string, Theme>;
  currentTheme: Theme | null;
  onThemeChange: (themeId: string) => void;
}

interface ProfileData {
  level: number;
  totalXP: number;
}

export default function ThemeGallery({ isOpen, onClose, themes, currentTheme, onThemeChange }: ThemeGalleryProps) {
  const [profileData, setProfileData] = useState<ProfileData>({ level: 1, totalXP: 0 });
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([]);
  const [newlyUnlockedThemes, setNewlyUnlockedThemes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'unlocked' | 'store'>('unlocked');

  useEffect(() => {
    if (isOpen) {
      loadProfileData();
      loadUnlockedThemes();
    }
  }, [isOpen]);

  const loadProfileData = async () => {
    try {
      // Load profile data similar to ProfileHeader
      const dailyLogs = await storage.load('daily-logs') || {};
      const missionXP = await storage.load('mission-xp') || 0;
      const achievementXP = await storage.load('achievement-xp') || 0;
      const dailyBonusXP = await storage.load('daily-activity-xp') || 0;
      const weeklyBonusXP = await storage.load('weekly-bonus-xp') || 0;
      const monthlyBonusXP = await storage.load('monthly-bonus-xp') || 0;
      
      // Calculate daily XP from logs
      let totalDailyXP = 0;
      Object.values(dailyLogs as Record<string, any>).forEach((log: any) => {
        const dailyXP = (log.habitsCompleted * 50) + (log.focusSessions * 25) - (log.snusCount * 10);
        totalDailyXP += Math.max(0, dailyXP);
      });
      
      // Calculate streak bonuses
      const habitStreak = await storage.load('habit-streak') || 0;
      const snusData = await storage.load('snus-data') || { currentStreak: 0 };
      const streakBonusXP = (habitStreak * 100) + (snusData.currentStreak * 150);
      
      const totalXP = totalDailyXP + dailyBonusXP + weeklyBonusXP + monthlyBonusXP + streakBonusXP + missionXP + achievementXP;
      const level = Math.floor(totalXP / 1000) + 1;
      
      setProfileData({ level, totalXP });
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const loadUnlockedThemes = async () => {
    try {
      const stored = await storage.load('unlocked-themes') || ['ambient']; // Always have starter theme
      setUnlockedThemes(stored);
    } catch (error) {
      console.error('Error loading unlocked themes:', error);
      setUnlockedThemes(['ambient']);
    }
  };

  const unlockTheme = async (themeId: string) => {
    try {
      const newUnlocked = [...unlockedThemes, themeId];
      setUnlockedThemes(newUnlocked);
      setNewlyUnlockedThemes([...newlyUnlockedThemes, themeId]);
      
      await storage.save('unlocked-themes', newUnlocked);
      
      // Add unlock achievement XP
      const currentAchievementXP = await storage.load('achievement-xp') || 0;
      const theme = themes[themeId];
      const bonusXP = getRarityBonusXP(theme.rarity);
      await storage.save('achievement-xp', currentAchievementXP + bonusXP);
      
      // Dispatch event to update profile
      window.dispatchEvent(new CustomEvent('achievementUnlocked'));
      
      console.log(`🎉 Theme unlocked: ${theme.name} (+${bonusXP} XP)`);
    } catch (error) {
      console.error('Error unlocking theme:', error);
    }
  };

  const getRarityBonusXP = (rarity: string): number => {
    switch (rarity) {
      case 'starter': return 0;
      case 'common': return 100;
      case 'rare': return 250;
      case 'epic': return 500;
      case 'legendary': return 1000;
      case 'mythic': return 2500;
      case 'transcendent': return 5000;
      default: return 0;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'starter': return 'from-gray-400 to-gray-600';
      case 'common': return 'from-green-400 to-green-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 via-orange-500 to-red-600';
      case 'mythic': return 'from-pink-400 via-purple-500 to-indigo-600';
      case 'transcendent': return 'from-yellow-300 via-yellow-400 via-orange-500 via-red-500 via-pink-500 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'starter': return <Star className="h-4 w-4" />;
      case 'common': return <CheckCircle className="h-4 w-4" />;
      case 'rare': return <Zap className="h-4 w-4" />;
      case 'epic': return <Crown className="h-4 w-4" />;
      case 'legendary': return <Sparkles className="h-4 w-4" />;
      case 'mythic': return <Crown className="h-4 w-4" />;
      case 'transcendent': return <Sparkles className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getRarityBorderColor = (rarity: string) => {
    switch (rarity) {
      case 'starter': return 'border-gray-500/30';
      case 'common': return 'border-green-500/30';
      case 'rare': return 'border-blue-500/30';
      case 'epic': return 'border-purple-500/30';
      case 'legendary': return 'border-yellow-500/30';
      case 'mythic': return 'border-pink-500/30';
      case 'transcendent': return 'border-yellow-400/40';
      default: return 'border-gray-500/30';
    }
  };

  const getAvailableThemes = () => {
    return Object.values(themes).filter(theme => 
      profileData.level >= theme.levelRequired && !unlockedThemes.includes(theme.id)
    );
  };

  const getLockedThemes = () => {
    return Object.values(themes)
      .filter(theme => profileData.level < theme.levelRequired)
      .sort((a, b) => a.levelRequired - b.levelRequired);
  };

  const getUnlockedThemesList = () => {
    return Object.values(themes).filter(theme => unlockedThemes.includes(theme.id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-black/95 backdrop-blur-2xl border-2 border-purple-500/30 text-white rounded-3xl p-0 overflow-hidden h-[85vh]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-2xl font-bold text-white flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-xl">
                  <Gift className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span>Theme Gallery</span>
                  <div className="text-sm font-normal text-gray-300">Level {profileData.level} • {profileData.totalXP.toLocaleString()} XP</div>
                </div>
              </DialogTitle>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-white/70" />
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-black/20 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('unlocked')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'unlocked'
                    ? 'bg-white/15 text-white shadow-lg border border-white/20'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>My Themes</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  {getUnlockedThemesList().length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('store')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'store'
                    ? 'bg-white/15 text-white shadow-lg border border-white/20'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Gift className="h-4 w-4" />
                <span>Store</span>
                {getAvailableThemes().length > 0 && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full animate-pulse">
                    {getAvailableThemes().length}
                  </span>
                )}
              </button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
            {/* My Themes Tab */}
            {activeTab === 'unlocked' && (
              <div>
                {getUnlockedThemesList().length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No Themes Unlocked</h3>
                    <p className="text-gray-400 mb-4">Visit the store to unlock your first theme!</p>
                    <button
                      onClick={() => setActiveTab('store')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Browse Store
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Your Collection</h3>
                      <Badge className="bg-green-500/20 text-green-400 px-2 py-1 text-xs">
                        {getUnlockedThemesList().length} Themes
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {getUnlockedThemesList().map((theme) => (
                        <div
                          key={theme.id}
                          className={`group bg-gradient-to-br from-black/60 via-gray-900/60 to-black/60 border-2 ${getRarityBorderColor(theme.rarity)} rounded-xl p-4 relative overflow-hidden hover:border-white/40 transition-all duration-300 cursor-pointer hover:scale-105 ${
                            currentTheme?.id === theme.id ? 'ring-2 ring-white/40 bg-gradient-to-br from-white/10 via-white/5 to-white/10' : ''
                          }`}
                          onClick={() => onThemeChange(theme.id)}
                        >
                          <div className="relative z-10">
                            {/* Theme Preview */}
                            <div 
                              className="w-full h-16 rounded-lg border-2 border-white/20 relative overflow-hidden mb-3"
                              style={{ backgroundColor: theme.backgroundColor }}
                            >
                              {theme.gradientSpots.length > 0 && (
                                <>
                                  <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full blur-sm opacity-70" />
                                  <div className="absolute bottom-0.5 left-0.5 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full blur-sm opacity-60" />
                                  <div className="absolute top-0.5 left-1/2 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-sm opacity-80" />
                                </>
                              )}
                              <div className="absolute inset-0 opacity-20" style={{
                                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                backgroundSize: '8px 8px'
                              }} />
                              
                              {/* Active indicator */}
                              {currentTheme?.id === theme.id && (
                                <div className="absolute top-1 right-1 bg-white text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                                  ACTIVE
                                </div>
                              )}

                              {/* Newly unlocked indicator */}
                              {newlyUnlockedThemes.includes(theme.id) && (
                                <div className="absolute top-1 left-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                                  NEW!
                                </div>
                              )}
                            </div>

                            {/* Theme Info */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-base font-bold text-white">{theme.name}</h4>
                                <Badge className={`bg-gradient-to-r ${getRarityColor(theme.rarity)} text-white px-1.5 py-0.5 text-xs flex items-center space-x-1`}>
                                  {getRarityIcon(theme.rarity)}
                                  <span>{theme.rarityLabel}</span>
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-300 line-clamp-2">{theme.description}</p>
                            </div>

                            {/* Apply Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onThemeChange(theme.id);
                              }}
                              className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                currentTheme?.id === theme.id
                                  ? 'bg-white/20 text-white border-2 border-white/40'
                                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border-2 border-white/20 hover:border-white/40'
                              }`}
                            >
                              {currentTheme?.id === theme.id ? 'Currently Active' : 'Apply Theme'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Store Tab */}
            {activeTab === 'store' && (
              <div className="space-y-6">
                {/* Available to Unlock */}
                {getAvailableThemes().length > 0 && (
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Gift className="h-5 w-5 text-yellow-400" />
                      <h3 className="text-xl font-bold text-yellow-400">Ready to Unlock!</h3>
                      <Badge className="bg-yellow-500/20 text-yellow-400 px-2 py-1 text-xs">
                        {getAvailableThemes().length} Available
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {getAvailableThemes().map((theme) => (
                        <div
                          key={theme.id}
                          className={`group bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border-2 border-yellow-500/40 rounded-xl p-4 relative overflow-hidden hover:border-yellow-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                        >
                          {/* Animated background glow */}
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-red-500/5 animate-pulse opacity-60" />
                          
                          <div className="relative z-10">
                            {/* Theme Preview */}
                            <div 
                              className="w-full h-16 rounded-lg border-2 border-white/20 relative overflow-hidden mb-3"
                              style={{ backgroundColor: theme.backgroundColor }}
                            >
                              {theme.gradientSpots.length > 0 && (
                                <>
                                  <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full blur-sm opacity-70" />
                                  <div className="absolute bottom-0.5 left-0.5 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full blur-sm opacity-60" />
                                  <div className="absolute top-0.5 left-1/2 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-sm opacity-80" />
                                </>
                              )}
                              <div className="absolute inset-0 opacity-20" style={{
                                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                backgroundSize: '8px 8px'
                              }} />
                              
                              {/* NEW badge */}
                              <div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full font-bold animate-bounce">
                                NEW!
                              </div>
                            </div>

                            {/* Theme Info */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-base font-bold text-white">{theme.name}</h4>
                                <Badge className={`bg-gradient-to-r ${getRarityColor(theme.rarity)} text-white px-1.5 py-0.5 text-xs flex items-center space-x-1`}>
                                  {getRarityIcon(theme.rarity)}
                                  <span>{theme.rarityLabel}</span>
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-300 mb-2 line-clamp-2">{theme.description}</p>
                              <div className="bg-black/40 rounded-lg p-2 border border-white/10">
                                <p className="text-xs text-yellow-300 font-medium line-clamp-2">"{theme.unlockMessage}"</p>
                              </div>
                            </div>

                            {/* Unlock Button */}
                            <ClaimButton
                              onClick={() => unlockTheme(theme.id)}
                              disabled={false}
                              variant="golden"
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <Sparkles className="h-4 w-4" />
                                <span>Unlock (+{getRarityBonusXP(theme.rarity)} XP)</span>
                              </div>
                            </ClaimButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked Themes */}
                {getLockedThemes().length > 0 && (
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Lock className="h-5 w-5 text-gray-400" />
                      <h3 className="text-xl font-bold text-gray-400">Future Unlocks</h3>
                      <Badge className="bg-gray-500/20 text-gray-400 px-2 py-1 text-xs">
                        {getLockedThemes().length} Locked
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {getLockedThemes().map((theme) => (
                        <div
                          key={theme.id}
                          className="group bg-gradient-to-br from-gray-900/40 via-gray-800/40 to-gray-900/40 border-2 border-gray-600/30 rounded-xl p-4 relative overflow-hidden opacity-75"
                        >
                          <div className="relative z-10">
                            {/* Theme Preview - Darkened */}
                            <div 
                              className="w-full h-16 rounded-lg border-2 border-gray-600/40 relative overflow-hidden mb-3 grayscale"
                              style={{ backgroundColor: theme.backgroundColor, filter: 'brightness(0.3)' }}
                            >
                              <div className="absolute inset-0 bg-black/50" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Lock className="h-6 w-6 text-white/60" />
                              </div>
                            </div>

                            {/* Theme Info */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-base font-bold text-gray-300">{theme.name}</h4>
                                <Badge className={`bg-gradient-to-r ${getRarityColor(theme.rarity)} text-white px-1.5 py-0.5 text-xs flex items-center space-x-1 opacity-60`}>
                                  {getRarityIcon(theme.rarity)}
                                  <span>{theme.rarityLabel}</span>
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-400 mb-2 line-clamp-2">{theme.description}</p>
                              
                              {/* Level Requirement */}
                              <div className="bg-gray-800/60 rounded-lg p-2 border border-gray-600/30">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-300">Required Level:</span>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-sm font-bold text-yellow-400">{theme.levelRequired}</span>
                                    <span className="text-xs text-gray-400">
                                      ({Math.max(0, (theme.levelRequired - 1) * 1000 - profileData.totalXP).toLocaleString()} XP)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Locked Button */}
                            <button
                              disabled
                              className="w-full px-3 py-2 bg-gray-700/40 text-gray-400 rounded-lg text-sm font-medium border-2 border-gray-600/30 cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                              <Lock className="h-3 w-3" />
                              <span>Level {theme.levelRequired} Required</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No available themes message */}
                {getAvailableThemes().length === 0 && getLockedThemes().length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Gift className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">All Themes Unlocked!</h3>
                    <p className="text-gray-400">You've collected every theme available. Legendary!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 