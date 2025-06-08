import React, { useState } from 'react';
import Navigation from './components/Navigation';
import HomeView from './views/HomeView';
import ProductivityView from './views/ProductivityView';
import PersonalView from './views/PersonalView';

type ViewType = 'home' | 'productivity' | 'personal';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');

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
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-auto">
      {/* Subtle orange gradient dots scattered around - BEHIND content */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-orange-400/40 to-amber-400/35 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-orange-500/35 to-red-400/30 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-gradient-to-r from-amber-400/45 to-orange-500/40 rounded-full blur-2xl"></div>
        <div className="absolute top-60 left-1/2 w-20 h-20 bg-gradient-to-r from-orange-400/30 to-amber-500/25 rounded-full blur-md"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-orange-400/38 to-red-400/32 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-amber-500/32 to-orange-400/28 rounded-full blur-lg"></div>
        <div className="absolute bottom-1/3 left-1/3 w-36 h-36 bg-gradient-to-r from-orange-500/42 to-amber-500/38 rounded-full blur-2xl"></div>
      </div>
      
      {/* Content layer - ABOVE the dots */}
      <div className="relative z-10">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        {renderView()}
      </div>
    </div>
  );
} 