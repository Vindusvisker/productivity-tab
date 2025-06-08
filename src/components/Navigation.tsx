import { Search, BarChart3, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewType = 'home' | 'productivity' | 'personal';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
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
                  "relative flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 overflow-hidden group",
                  isActive 
                    ? "text-white shadow-lg" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                {isActive && (
                  <>
                    {/* Gradient border */}
                    <div 
                      className="absolute inset-0 rounded-full p-[1px]"
                      style={{
                        background: 'linear-gradient(135deg, rgb(122, 105, 249), rgb(242, 99, 120), rgb(245, 131, 63))'
                      }}
                    >
                      <div className="h-full w-full rounded-full bg-black/50 backdrop-blur-sm" />
                    </div>
                    {/* Inner glow */}
                    <div 
                      className="absolute inset-0 rounded-full blur-sm opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, rgb(122, 105, 249), rgb(242, 99, 120), rgb(245, 131, 63))'
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