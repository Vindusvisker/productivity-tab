import React, { useState, useEffect } from 'react';
import { ChevronDown, Palette } from 'lucide-react';
import Navigation from './components/Navigation';
import StarButton from './components/StarButton';
import ThemeGallery from './components/ThemeGallery';
import HomeView from './views/HomeView';
import ProductivityView from './views/ProductivityView';
import PersonalView from './views/PersonalView';
import VisionView from './views/VisionView';
import FinancialView from './views/FinancialView';

type ViewType = 'home' | 'productivity' | 'personal' | 'vision' | 'financial';

// Enhanced theme definitions with gamification
const themes = {
  ambient: {
    id: 'ambient',
    name: 'Ambient Glow',
    description: 'Colorful gradient spots with rich grain',
    rarity: 'starter',
    rarityLabel: 'Starter',
    levelRequired: 1,
    unlockMessage: 'Welcome to your journey! This signature theme grows with you.',
    backgroundColor: '#2a2a2a',
    gradientSpots: [
      'absolute top-20 right-32 w-80 h-80 bg-gradient-to-r from-orange-400/45 via-amber-500/35 to-yellow-400/25 rounded-tl-3xl rounded-br-xl rounded-tr-2xl rounded-bl-2xl blur-3xl',
      'absolute bottom-40 left-20 w-96 h-96 bg-gradient-to-br from-purple-500/35 via-pink-400/30 to-rose-400/20 rounded-tl-2xl rounded-br-3xl rounded-tr-xl rounded-bl-3xl blur-3xl',
      'absolute top-1/2 right-20 w-64 h-64 bg-gradient-to-tl from-blue-400/50 via-cyan-300/40 to-teal-300/35 rounded-tl-xl rounded-br-2xl rounded-tr-3xl rounded-bl-xl blur-3xl',
      'absolute bottom-20 right-1/3 w-72 h-72 bg-gradient-to-tr from-yellow-400/40 via-orange-300/35 to-red-400/25 rounded-tl-3xl rounded-br-2xl rounded-tr-xl rounded-bl-2xl blur-3xl',
      'absolute top-32 left-1/3 w-56 h-56 bg-gradient-to-bl from-emerald-400/30 via-teal-300/25 to-green-400/15 rounded-tl-2xl rounded-br-xl rounded-tr-2xl rounded-bl-3xl blur-3xl',
      'absolute top-2/3 right-1/2 w-44 h-44 bg-gradient-to-r from-rose-400/25 via-violet-400/35 to-purple-400/30 rounded-tl-xl rounded-br-3xl rounded-tr-2xl rounded-bl-xl blur-3xl'
    ],
    grainOpacity: 80,
    grainColors: 'light'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Dark',
    description: 'Clean dark background with subtle grain',
    rarity: 'common',
    rarityLabel: 'Common',
    levelRequired: 2,
    unlockMessage: 'Clean and focused - perfect for deep work sessions.',
    backgroundColor: '#1a1a1a',
    gradientSpots: [],
    grainOpacity: 30,
    grainColors: 'light'
  },
  neon: {
    id: 'neon',
    name: 'Neon Nights',
    description: 'Cyberpunk vibes with electric colors',
    rarity: 'rare',
    rarityLabel: 'Rare',
    levelRequired: 7,
    unlockMessage: 'Enter the digital realm. Your cyber-productivity awaits.',
    backgroundColor: '#0a0a0a',
    gradientSpots: [
      'absolute top-10 left-20 w-72 h-72 bg-gradient-to-r from-cyan-400/35 via-blue-500/30 to-indigo-600/25 rounded-full blur-3xl',
      'absolute bottom-20 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/30 via-purple-600/25 to-violet-700/20 rounded-full blur-3xl',
      'absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-green-400/25 via-emerald-500/20 to-teal-600/15 rounded-full blur-3xl'
    ],
    grainOpacity: 60,
    grainColors: 'light'
  },
  warm: {
    id: 'warm',
    name: 'Warm Sunset',
    description: 'Cozy orange and red tones',
    rarity: 'common',
    rarityLabel: 'Common',
    levelRequired: 3,
    unlockMessage: 'Embrace the warmth of productivity. Cozy vibes for long sessions.',
    backgroundColor: '#2d1b1b',
    gradientSpots: [
      'absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-orange-500/35 via-red-400/30 to-rose-500/25 rounded-full blur-3xl',
      'absolute bottom-32 left-32 w-80 h-80 bg-gradient-to-r from-amber-400/30 via-orange-600/25 to-red-500/20 rounded-full blur-3xl',
      'absolute top-20 left-1/2 w-64 h-64 bg-gradient-to-r from-yellow-400/25 via-amber-500/20 to-orange-600/15 rounded-full blur-3xl'
    ],
    grainOpacity: 50,
    grainColors: 'light'
  },
  cool: {
    id: 'cool',
    name: 'Cool Breeze',
    description: 'Professional blues and teals',
    rarity: 'rare',
    rarityLabel: 'Rare',
    levelRequired: 5,
    unlockMessage: 'Professional excellence unlocked. Channel your inner business warrior.',
    backgroundColor: '#1a1f2e',
    gradientSpots: [
      'absolute top-20 left-40 w-88 h-88 bg-gradient-to-r from-blue-400/30 via-indigo-500/25 to-purple-600/20 rounded-full blur-3xl',
      'absolute bottom-40 right-20 w-72 h-72 bg-gradient-to-r from-teal-400/25 via-cyan-500/20 to-blue-600/15 rounded-full blur-3xl',
      'absolute top-1/2 right-1/3 w-60 h-60 bg-gradient-to-r from-slate-400/20 via-blue-300/15 to-indigo-400/10 rounded-full blur-3xl'
    ],
    grainOpacity: 45,
    grainColors: 'light'
  },
  mintlify: {
    id: 'mintlify',
    name: 'Mintlify Docs',
    description: 'Documentation platform inspired green gradients',
    rarity: 'epic',
    rarityLabel: 'Epic',
    levelRequired: 10,
    unlockMessage: 'Developer tier achieved! Channel the power of clean documentation.',
    backgroundColor: '#0a0f0a',
    gradientSpots: [
      'absolute top-32 right-20 w-96 h-96 bg-gradient-to-r from-emerald-400/40 via-teal-500/35 to-cyan-600/30 rounded-full blur-3xl',
      'absolute bottom-20 left-32 w-80 h-80 bg-gradient-to-r from-cyan-400/35 via-emerald-600/30 to-green-700/25 rounded-full blur-3xl',
      'absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-teal-300/30 via-green-500/25 to-emerald-600/20 rounded-full blur-3xl',
      'absolute bottom-1/2 right-1/4 w-88 h-88 bg-gradient-to-r from-green-400/35 via-cyan-500/30 to-teal-600/25 rounded-full blur-3xl',
      'absolute top-2/3 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-300/25 via-teal-400/20 to-green-500/15 rounded-full blur-3xl'
    ],
    grainOpacity: 65,
    grainColors: 'light'
  },
  space: {
    id: 'space',
    name: 'Deep Space',
    description: 'Cosmic elegance with deep purples and indigos',
    rarity: 'legendary',
    rarityLabel: 'Legendary',
    levelRequired: 15,
    unlockMessage: 'Cosmic mastery unlocked! Transcend earthly limits in the void.',
    backgroundColor: '#0b0c1a',
    gradientSpots: [
      'absolute top-20 right-24 w-88 h-88 bg-gradient-to-r from-indigo-500/35 via-purple-600/30 to-violet-700/25 rounded-full blur-3xl',
      'absolute bottom-32 left-20 w-96 h-96 bg-gradient-to-r from-violet-500/30 via-indigo-700/25 to-slate-800/20 rounded-full blur-3xl',
      'absolute top-1/2 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/25 via-slate-600/20 to-indigo-700/15 rounded-full blur-3xl',
      'absolute bottom-20 right-1/3 w-80 h-80 bg-gradient-to-r from-indigo-400/30 via-purple-500/25 to-violet-600/20 rounded-full blur-3xl',
      'absolute top-40 left-1/2 w-64 h-64 bg-gradient-to-r from-violet-400/20 via-indigo-500/18 to-purple-600/15 rounded-full blur-3xl',
      'absolute bottom-1/2 right-20 w-56 h-56 bg-gradient-to-r from-purple-300/18 via-slate-500/15 to-indigo-600/12 rounded-full blur-3xl'
    ],
    grainOpacity: 55,
    grainColors: 'light'
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora Dreams',
    description: 'Ethereal northern lights dancing across the sky',
    rarity: 'mythic',
    rarityLabel: 'Mythic',
    levelRequired: 20,
    unlockMessage: 'Witness the divine aurora! You have achieved transcendent focus.',
    backgroundColor: '#0a0e1a',
    gradientSpots: [
      'absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-emerald-400/40 via-cyan-500/35 to-blue-600/30 rounded-full blur-3xl',
      'absolute bottom-10 right-10 w-88 h-88 bg-gradient-to-r from-violet-500/35 via-pink-400/30 to-rose-500/25 rounded-full blur-3xl',
      'absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-green-400/30 via-teal-500/25 to-cyan-600/20 rounded-full blur-3xl',
      'absolute bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/25 via-indigo-500/20 to-violet-600/15 rounded-full blur-3xl'
    ],
    grainOpacity: 70,
    grainColors: 'light'
  },
  phoenix: {
    id: 'phoenix',
    name: 'Phoenix Rising',
    description: 'Rebirth through fire and determination',
    rarity: 'mythic',
    rarityLabel: 'Mythic',
    levelRequired: 25,
    unlockMessage: 'From ashes to glory! Your dedication burns eternal.',
    backgroundColor: '#1a0a0a',
    gradientSpots: [
      'absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-red-500/45 via-orange-600/40 to-yellow-500/35 rounded-full blur-3xl',
      'absolute bottom-20 left-20 w-88 h-88 bg-gradient-to-r from-amber-500/35 via-red-600/30 to-rose-700/25 rounded-full blur-3xl',
      'absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-orange-400/30 via-yellow-500/25 to-amber-600/20 rounded-full blur-3xl'
    ],
    grainOpacity: 60,
    grainColors: 'light'
  },
  quantum: {
    id: 'quantum',
    name: 'Quantum Flux',
    description: 'Reality bends to your productive will',
    rarity: 'mythic',
    rarityLabel: 'Mythic',
    levelRequired: 30,
    unlockMessage: 'You have mastered the quantum realm of productivity.',
    backgroundColor: '#0f0f23',
    gradientSpots: [
      'absolute top-16 right-16 w-80 h-80 bg-gradient-to-r from-cyan-400/40 via-blue-500/35 to-purple-600/30 rounded-full blur-3xl',
      'absolute bottom-16 left-16 w-96 h-96 bg-gradient-to-r from-pink-500/35 via-violet-600/30 to-indigo-700/25 rounded-full blur-3xl',
      'absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-emerald-400/25 via-cyan-500/20 to-blue-600/15 rounded-full blur-3xl',
      'absolute bottom-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-purple-400/30 via-pink-500/25 to-rose-600/20 rounded-full blur-3xl'
    ],
    grainOpacity: 75,
    grainColors: 'light'
  },
  godmode: {
    id: 'godmode',
    name: 'God Mode',
    description: 'Transcendent power flows through every pixel',
    rarity: 'transcendent',
    rarityLabel: 'Transcendent',
    levelRequired: 50,
    unlockMessage: 'You have achieved the impossible. Welcome to divinity.',
    backgroundColor: '#1a1a1a',
    gradientSpots: [
      'absolute top-12 right-12 w-96 h-96 bg-gradient-to-r from-yellow-400/50 via-orange-500/45 to-red-600/40 rounded-full blur-3xl',
      'absolute bottom-12 left-12 w-88 h-88 bg-gradient-to-r from-purple-500/40 via-pink-600/35 to-rose-700/30 rounded-full blur-3xl',
      'absolute top-1/4 left-1/2 w-80 h-80 bg-gradient-to-r from-cyan-400/35 via-blue-500/30 to-indigo-600/25 rounded-full blur-3xl',
      'absolute bottom-1/4 right-1/2 w-72 h-72 bg-gradient-to-r from-emerald-400/30 via-teal-500/25 to-green-600/20 rounded-full blur-3xl',
      'absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-violet-400/25 via-purple-500/20 to-indigo-600/15 rounded-full blur-3xl'
    ],
    grainOpacity: 85,
    grainColors: 'light'
  },
  omnipotent: {
    id: 'omnipotent',
    name: 'Omnipotent',
    description: 'Reality itself reshapes around your presence',
    rarity: 'transcendent',
    rarityLabel: 'Transcendent',
    levelRequired: 100,
    unlockMessage: 'You have become legend. The universe acknowledges your supremacy.',
    backgroundColor: '#000000',
    gradientSpots: [
      'absolute top-8 right-8 w-full h-full bg-gradient-radial from-yellow-400/60 via-orange-500/45 via-red-600/35 via-purple-700/25 via-blue-800/15 to-transparent rounded-full blur-3xl',
      'absolute bottom-8 left-8 w-96 h-96 bg-gradient-to-r from-cyan-400/40 via-emerald-500/35 to-teal-600/30 rounded-full blur-3xl',
      'absolute top-1/3 left-1/3 w-88 h-88 bg-gradient-to-r from-pink-500/35 via-rose-600/30 to-red-700/25 rounded-full blur-3xl'
    ],
    grainOpacity: 90,
    grainColors: 'light'
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [currentTheme, setCurrentTheme] = useState<typeof themes.ambient | null>(null);
  const [isThemeGalleryOpen, setIsThemeGalleryOpen] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Load theme from Chrome storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          const result = await chrome.storage.local.get('background-theme');
          const savedThemeId = result['background-theme'];
          if (savedThemeId && themes[savedThemeId as keyof typeof themes]) {
            setCurrentTheme(themes[savedThemeId as keyof typeof themes]);
            console.log('Loaded theme from storage:', savedThemeId);
          } else {
            // No saved theme, use default
            setCurrentTheme(themes.ambient);
          }
        } else {
          // Fallback if Chrome storage not available
          setCurrentTheme(themes.ambient);
        }
      } catch (error) {
        console.warn('Failed to load theme from storage:', error);
        setCurrentTheme(themes.ambient);
      } finally {
        setIsThemeLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // Save theme when it changes
  const changeTheme = async (themeId: keyof typeof themes) => {
    console.log('Changing theme to:', themeId);
    setCurrentTheme(themes[themeId]);
    setIsThemeGalleryOpen(false);

    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ 'background-theme': themeId });
        console.log('Saved theme to storage:', themeId);
      }
    } catch (error) {
      console.warn('Failed to save theme:', error);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'productivity':
        return <ProductivityView />;
      case 'personal':
        return <PersonalView />;
      case 'vision':
        return <VisionView />;
      case 'financial':
        return <FinancialView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      {/* Add custom zoom-in animation */}
      <style>
        {`
          @keyframes zoomIn {
            0% {
              transform: scale(0.95);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
      
      {/* Smooth zoom-in entrance animation instead of flicker */}
      {!isThemeLoaded || !currentTheme ? (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
          <div className="text-white/60 text-sm animate-pulse">Loading your workspace...</div>
        </div>
      ) : (
        <div 
          key={currentTheme.id}
          className="fixed inset-0 overflow-auto transition-all duration-700 ease-out" 
          style={{ 
            backgroundColor: currentTheme.backgroundColor,
            animation: 'zoomIn 0.6s ease-out',
            transform: 'scale(1)',
            opacity: 1
          }}
        >
          {/* Gradient spots */}
          {currentTheme.gradientSpots.length > 0 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              {currentTheme.gradientSpots.map((spotClasses, index) => (
                <div key={`${currentTheme.id}-spot-${index}`} className={spotClasses} />
              ))}
            </div>
          )}

          {/* Grain texture / Stars / Hex Grid */}
          <div 
            className="absolute inset-0 pointer-events-none z-1"
            style={{
              opacity: currentTheme.grainOpacity / 100,
              backgroundImage: currentTheme.id === 'space' ? 
                // Starry night sky pattern for Deep Space theme
                `
                  radial-gradient(circle at 15% 25%, rgba(255,255,255,0.9) 1px, transparent 1px),
                  radial-gradient(circle at 85% 15%, rgba(255,255,255,0.7) 1px, transparent 1px),
                  radial-gradient(circle at 45% 65%, rgba(255,255,255,0.8) 1px, transparent 1px),
                  radial-gradient(circle at 75% 85%, rgba(255,255,255,0.6) 1px, transparent 1px),
                  radial-gradient(circle at 25% 75%, rgba(255,255,255,0.9) 1px, transparent 1px),
                  radial-gradient(circle at 92% 45%, rgba(255,255,255,0.5) 1px, transparent 1px),
                  radial-gradient(circle at 8% 55%, rgba(255,255,255,0.7) 1px, transparent 1px),
                  radial-gradient(circle at 55% 25%, rgba(255,255,255,0.6) 1px, transparent 1px),
                  radial-gradient(circle at 35% 90%, rgba(255,255,255,0.8) 1px, transparent 1px),
                  radial-gradient(circle at 65% 10%, rgba(255,255,255,0.5) 1px, transparent 1px),
                  radial-gradient(circle at 18% 42%, rgba(255,255,255,0.4) 2px, transparent 2px),
                  radial-gradient(circle at 78% 68%, rgba(255,255,255,0.5) 2px, transparent 2px),
                  radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 1.5px, transparent 1.5px),
                  radial-gradient(circle at 88% 78%, rgba(255,255,255,0.6) 1.5px, transparent 1.5px),
                  radial-gradient(circle at 12% 88%, rgba(255,255,255,0.4) 1.5px, transparent 1.5px)
                ` : currentTheme.id === 'mintlify' ?
                // Hexagonal grid pattern for Mintlify theme
                `
                  radial-gradient(circle at 20% 20%, rgba(52, 211, 153, 0.15) 1px, transparent 1px),
                  radial-gradient(circle at 40% 40%, rgba(52, 211, 153, 0.10) 1px, transparent 1px),
                  radial-gradient(circle at 60% 20%, rgba(52, 211, 153, 0.12) 1px, transparent 1px),
                  radial-gradient(circle at 80% 40%, rgba(52, 211, 153, 0.08) 1px, transparent 1px),
                  radial-gradient(circle at 20% 60%, rgba(52, 211, 153, 0.14) 1px, transparent 1px),
                  radial-gradient(circle at 40% 80%, rgba(52, 211, 153, 0.09) 1px, transparent 1px),
                  radial-gradient(circle at 60% 60%, rgba(52, 211, 153, 0.11) 1px, transparent 1px),
                  radial-gradient(circle at 80% 80%, rgba(52, 211, 153, 0.07) 1px, transparent 1px),
                  radial-gradient(circle at 10% 30%, rgba(6, 182, 212, 0.10) 1px, transparent 1px),
                  radial-gradient(circle at 30% 50%, rgba(6, 182, 212, 0.08) 1px, transparent 1px),
                  radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.12) 1px, transparent 1px),
                  radial-gradient(circle at 70% 50%, rgba(6, 182, 212, 0.09) 1px, transparent 1px),
                  radial-gradient(circle at 90% 30%, rgba(6, 182, 212, 0.06) 1px, transparent 1px)
                ` :
                // Regular grain pattern for other themes
                `
                  radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12) 1px, transparent 1px),
                  radial-gradient(circle at 80% 70%, rgba(255,255,255,0.10) 1px, transparent 1px),
                  radial-gradient(circle at 40% 80%, rgba(0,0,0,0.15) 1px, transparent 1px),
                  radial-gradient(circle at 90% 20%, rgba(255,255,255,0.08) 1px, transparent 1px),
                  radial-gradient(circle at 10% 90%, rgba(0,0,0,0.12) 1px, transparent 1px)
                `,
              backgroundSize: currentTheme.id === 'space' ? 
                // Larger, more varied sizes for stars
                '200px 200px, 180px 180px, 160px 160px, 220px 220px, 190px 190px, 170px 170px, 210px 210px, 160px 160px, 180px 180px, 200px 200px, 240px 240px, 220px 220px, 160px 160px, 190px 190px, 210px 210px' :
                currentTheme.id === 'mintlify' ?
                // Hexagonal grid sizes for structured pattern
                '60px 60px, 80px 80px, 60px 60px, 80px 80px, 60px 60px, 80px 80px, 60px 60px, 80px 80px, 70px 70px, 90px 90px, 70px 70px, 90px 90px, 70px 70px' :
                // Regular grain sizes
                '80px 80px, 95px 95px, 70px 70px, 85px 85px, 90px 90px'
            }}
          />
          
          {/* Content layer */}
          <div className="relative z-10">
            <Navigation currentView={currentView} onViewChange={setCurrentView} currentTheme={currentTheme} />
            {renderView()}
          </div>
          
          {/* Theme Gallery Button - Fixed at top right */}
          <div className="fixed top-6 right-6 z-20">
            <button
              onClick={() => setIsThemeGalleryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/30 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:scale-105 group"
            >
              <Palette className="w-5 h-5 text-white/70 group-hover:text-white/90 transition-colors" />
              <span className="text-sm text-white/80 group-hover:text-white/90 font-medium transition-colors">{currentTheme.name}</span>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse" />
            </button>
          </div>

          {/* Theme Gallery Modal */}
          <ThemeGallery
            isOpen={isThemeGalleryOpen}
            onClose={() => setIsThemeGalleryOpen(false)}
            themes={themes}
            currentTheme={currentTheme}
            onThemeChange={(themeId) => changeTheme(themeId as keyof typeof themes)}
          />
          
          {/* Star Button - Fixed at bottom left */}
          <div className="fixed bottom-6 left-6 z-20">
            <StarButton />
          </div>
        </div>
      )}
    </>
  );
} 