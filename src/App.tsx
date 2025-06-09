import React, { useState, useEffect } from 'react';
import { ChevronDown, Palette } from 'lucide-react';
import Navigation from './components/Navigation';
import StarButton from './components/StarButton';
import HomeView from './views/HomeView';
import ProductivityView from './views/ProductivityView';
import PersonalView from './views/PersonalView';

type ViewType = 'home' | 'productivity' | 'personal';

// All theme definitions in one place (Chrome extension friendly)
const themes = {
  ambient: {
    id: 'ambient',
    name: 'Ambient Glow',
    description: 'Colorful gradient spots with rich grain',
    backgroundColor: '#313131',
    gradientSpots: [
      'absolute top-20 right-32 w-80 h-80 bg-gradient-to-r from-orange-400/30 to-amber-500/20 rounded-full blur-3xl',
      'absolute bottom-40 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/25 to-pink-400/15 rounded-full blur-3xl',
      'absolute top-1/2 right-20 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-cyan-300/15 rounded-full blur-3xl',
      'absolute bottom-20 right-1/3 w-72 h-72 bg-gradient-to-r from-yellow-400/25 to-orange-300/20 rounded-full blur-3xl',
      'absolute top-32 left-1/3 w-56 h-56 bg-gradient-to-r from-emerald-400/20 to-teal-300/15 rounded-full blur-3xl'
    ],
    grainOpacity: 80,
    grainColors: 'light' // for dark backgrounds
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Dark',
    description: 'Clean dark background with subtle grain',
    backgroundColor: '#1a1a1a',
    gradientSpots: [],
    grainOpacity: 30,
    grainColors: 'light'
  },
  neon: {
    id: 'neon',
    name: 'Neon Nights',
    description: 'Cyberpunk vibes with electric colors',
    backgroundColor: '#0a0a0a',
    gradientSpots: [
      'absolute top-10 left-20 w-72 h-72 bg-gradient-to-r from-cyan-400/35 to-blue-500/25 rounded-full blur-3xl',
      'absolute bottom-20 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/30 to-purple-600/20 rounded-full blur-3xl',
      'absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-green-400/25 to-emerald-500/15 rounded-full blur-3xl'
    ],
    grainOpacity: 60,
    grainColors: 'light'
  },
  warm: {
    id: 'warm',
    name: 'Warm Sunset',
    description: 'Cozy orange and red tones',
    backgroundColor: '#2d1b1b',
    gradientSpots: [
      'absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-orange-500/35 to-red-400/25 rounded-full blur-3xl',
      'absolute bottom-32 left-32 w-80 h-80 bg-gradient-to-r from-amber-400/30 to-orange-600/20 rounded-full blur-3xl',
      'absolute top-20 left-1/2 w-64 h-64 bg-gradient-to-r from-yellow-400/25 to-amber-500/15 rounded-full blur-3xl'
    ],
    grainOpacity: 50,
    grainColors: 'light'
  },
  cool: {
    id: 'cool',
    name: 'Cool Breeze',
    description: 'Professional blues and teals',
    backgroundColor: '#1a1f2e',
    gradientSpots: [
      'absolute top-20 left-40 w-88 h-88 bg-gradient-to-r from-blue-400/30 to-indigo-500/20 rounded-full blur-3xl',
      'absolute bottom-40 right-20 w-72 h-72 bg-gradient-to-r from-teal-400/25 to-cyan-500/15 rounded-full blur-3xl',
      'absolute top-1/2 right-1/3 w-60 h-60 bg-gradient-to-r from-slate-400/20 to-blue-300/10 rounded-full blur-3xl'
    ],
    grainOpacity: 45,
    grainColors: 'light'
  },
  mintlify: {
    id: 'mintlify',
    name: 'Mintlify Docs',
    description: 'Documentation platform inspired green gradients',
    backgroundColor: '#0a0f0a',
    gradientSpots: [
      'absolute top-32 right-20 w-96 h-96 bg-gradient-to-r from-emerald-400/40 to-teal-500/30 rounded-full blur-3xl',
      'absolute bottom-20 left-32 w-80 h-80 bg-gradient-to-r from-cyan-400/35 to-emerald-600/25 rounded-full blur-3xl',
      'absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-teal-300/30 to-green-500/20 rounded-full blur-3xl',
      'absolute bottom-1/2 right-1/4 w-88 h-88 bg-gradient-to-r from-green-400/35 to-cyan-500/25 rounded-full blur-3xl',
      'absolute top-2/3 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-300/25 to-teal-400/15 rounded-full blur-3xl'
    ],
    grainOpacity: 65,
    grainColors: 'light'
  },
  space: {
    id: 'space',
    name: 'Deep Space',
    description: 'Cosmic elegance with deep purples and indigos',
    backgroundColor: '#0b0c1a',
    gradientSpots: [
      'absolute top-20 right-24 w-88 h-88 bg-gradient-to-r from-indigo-500/35 to-purple-600/25 rounded-full blur-3xl',
      'absolute bottom-32 left-20 w-96 h-96 bg-gradient-to-r from-violet-500/30 to-indigo-700/20 rounded-full blur-3xl',
      'absolute top-1/2 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/25 to-slate-600/15 rounded-full blur-3xl',
      'absolute bottom-20 right-1/3 w-80 h-80 bg-gradient-to-r from-indigo-400/30 to-purple-500/20 rounded-full blur-3xl',
      'absolute top-40 left-1/2 w-64 h-64 bg-gradient-to-r from-violet-400/20 to-indigo-500/15 rounded-full blur-3xl',
      'absolute bottom-1/2 right-20 w-56 h-56 bg-gradient-to-r from-purple-300/18 to-slate-500/12 rounded-full blur-3xl'
    ],
    grainOpacity: 55,
    grainColors: 'light'
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [currentTheme, setCurrentTheme] = useState(themes.ambient);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

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
          }
        }
      } catch (error) {
        console.warn('Failed to load theme from storage:', error);
      }
    };
    loadTheme();
  }, []);

  // Save theme when it changes
  const changeTheme = async (themeId: keyof typeof themes) => {
    console.log('Changing theme to:', themeId);
    setCurrentTheme(themes[themeId]);
    setIsThemeDropdownOpen(false);

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
      default:
        return <HomeView />;
    }
  };

  return (
    <div 
      key={currentTheme.id}
      className="fixed inset-0 overflow-auto transition-colors duration-500" 
      style={{ backgroundColor: currentTheme.backgroundColor }}
    >
      {/* Gradient spots */}
      {currentTheme.gradientSpots.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {currentTheme.gradientSpots.map((spotClasses, index) => (
            <div key={`${currentTheme.id}-spot-${index}`} className={spotClasses} />
          ))}
        </div>
      )}

      {/* Grain texture */}
      <div 
        className="absolute inset-0 pointer-events-none z-1"
        style={{
          opacity: currentTheme.grainOpacity / 100,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12) 1px, transparent 1px),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.10) 1px, transparent 1px),
            radial-gradient(circle at 40% 80%, rgba(0,0,0,0.15) 1px, transparent 1px),
            radial-gradient(circle at 90% 20%, rgba(255,255,255,0.08) 1px, transparent 1px),
            radial-gradient(circle at 10% 90%, rgba(0,0,0,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px, 95px 95px, 70px 70px, 85px 85px, 90px 90px'
        }}
      />
      
      {/* Content layer */}
      <div className="relative z-10">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        {renderView()}
      </div>
      
      {/* Theme Selector Dropdown - Fixed at top right */}
      <div className="fixed top-6 right-6 z-20">
        <div className="relative">
          <button
            onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10"
          >
            <Palette className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/80 font-medium">{currentTheme.name}</span>
            <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-200 ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isThemeDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsThemeDropdownOpen(false)}
              />
              <div className="absolute top-full mt-2 right-0 z-50 w-72 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-2">
                  {Object.values(themes).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => changeTheme(theme.id as keyof typeof themes)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-white/10 ${
                        currentTheme.id === theme.id ? 'bg-white/15 border border-white/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-12 h-8 rounded-md border border-white/20 relative overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: theme.backgroundColor }}
                        >
                          {theme.gradientSpots.length > 0 && (
                            <>
                              <div className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full blur-sm opacity-60" />
                              <div className="absolute bottom-0 left-0 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full blur-sm opacity-50" />
                            </>
                          )}
                          <div className="absolute inset-0 opacity-30" style={{
                            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '8px 8px'
                          }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white/90 text-sm">{theme.name}</div>
                          <div className="text-xs text-white/60 mt-0.5">{theme.description}</div>
                        </div>
                        {currentTheme.id === theme.id && (
                          <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Star Button - Fixed at bottom left */}
      <div className="fixed bottom-6 left-6 z-20">
        <StarButton />
      </div>
    </div>
  );
} 