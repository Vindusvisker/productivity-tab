import { Search, BarChart3, Trophy, Eye, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewType = 'home' | 'productivity' | 'personal' | 'vision' | 'financial';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  currentTheme: {
    id: string;
    name: string;
    description: string;
    backgroundColor: string;
    gradientSpots: string[];
    grainOpacity: number;
    grainColors: string;
  };
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, currentTheme }) => {
  // Get theme-specific gradient colors
  const getThemeGradient = (themeId: string) => {
    switch (themeId) {
      case 'ambient':
        return 'linear-gradient(135deg, rgb(147, 51, 234), rgb(99, 102, 241), rgb(59, 130, 246))';
      case 'minimal':
        return 'linear-gradient(135deg, rgb(156, 163, 175), rgb(107, 114, 128), rgb(75, 85, 99))';
      case 'neon':
        return 'linear-gradient(135deg, rgb(34, 197, 94), rgb(59, 130, 246), rgb(147, 51, 234))';
      case 'warm':
        return 'linear-gradient(135deg, rgb(251, 146, 60), rgb(239, 68, 68), rgb(245, 158, 11))';
      case 'cool':
        return 'linear-gradient(135deg, rgb(59, 130, 246), rgb(99, 102, 241), rgb(20, 184, 166))';
      case 'mintlify':
        return 'linear-gradient(135deg, rgb(34, 160, 120), rgb(4, 140, 160), rgb(20, 150, 70))';
      case 'space':
        return 'linear-gradient(135deg, rgb(99, 102, 241), rgb(139, 92, 246), rgb(168, 85, 247))';
      default:
        return 'linear-gradient(135deg, rgb(122, 105, 249), rgb(242, 99, 120), rgb(245, 131, 63))';
    }
  };

  const themeGradient = getThemeGradient(currentTheme.id);

  const navItems = [
    {
      id: 'home' as ViewType,
      label: 'Home',
      icon: Search,
    },
    {
      id: 'productivity' as ViewType,
      label: 'Productivity',
      icon: BarChart3,
    },
    {
      id: 'personal' as ViewType,
      label: 'Personal',
      icon: Trophy,
    },
    {
      id: 'vision' as ViewType,
      label: 'Vision',
      icon: Eye,
    },
    {
      id: 'financial' as ViewType,
      label: 'Expenses',
      icon: DollarSign,
    }
  ];

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4 bg-black/20 backdrop-blur-xl rounded-full p-2 border border-white/10 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "relative flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-500 overflow-hidden group",
                  isActive 
                    ? "text-white shadow-lg" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)'
                }}
              >
                {isActive && (
                  <>
                    {/* Gradient background */}
                    <div 
                      className="absolute inset-0 rounded-full animate-in fade-in-0 zoom-in-90 duration-[1200ms]"
                      style={{
                        background: themeGradient,
                        animationTimingFunction: 'cubic-bezier(0.16,1,0.3,1)'
                      }}
                    />
                    {/* Inner glow */}
                    <div 
                      className="absolute inset-0 rounded-full blur-sm opacity-50 animate-in fade-in-0 zoom-in-75 duration-[1500ms]"
                      style={{
                        background: themeGradient,
                        animationTimingFunction: 'cubic-bezier(0.16,1,0.3,1)'
                      }}
                    />
                  </>
                )}
                <Icon className={cn(
                  "h-4 w-4 transition-transform duration-200 relative z-10",
                  isActive ? "scale-110" : "group-hover:scale-105"
                )} />
                <span className="relative z-10 whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navigation; 