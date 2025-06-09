# Personal Productivity Dashboard - Chrome Extension

A sophisticated Chrome extension that transforms your new tab into a comprehensive personal productivity and wellness dashboard. Built with React, TypeScript, and modern web technologies, this extension helps you track habits, monitor mood, maintain focus, and visualize your personal development journey - all while providing quick access to your essential tools.

## 🌟 Key Features

### 🏠 **Home Dashboard**
- **Real-time Clock** - Elegant time and date display with smooth animations
- **Habit Breaking Tools** - Advanced Snus/Nicotine tracker with psychological motivation system
- **Quick Access Hub** - Customizable shortcuts to GitHub, ChatGPT, Calendar, and daily tools
- **Animated Interface** - Beautiful iOS-inspired animations and transitions

### 💪 **Productivity Suite**
- **Smart Habit Tracker** - Customizable daily habits with streak tracking and visual progress
- **Pomodoro Focus Timer** - 25-minute focus sessions with break management
- **Weekly Analytics** - Heatmap visualization of productivity patterns and trends
- **Achievement System** - Gamified progress tracking with unlockable rewards

### 🧠 **Personal Wellness**
- **Advanced Mood Tracking** - Apple Health-inspired mood scale (0-6) with color visualization
- **Emotional Intelligence** - Detailed feeling and context tagging for deeper self-awareness
- **Weekly Reflection** - Comprehensive mood analysis with historical data and insights
- **Journey Heatmap** - GitHub-style contribution graph for life activities
- **Mission System** - Goal setting and tracking with progress visualization

### 🎯 **Core Philosophy**
This extension operates on the principle that **"what you measure, you can improve"**. By integrating tracking seamlessly into your browsing experience, it encourages consistent self-reflection and continuous improvement without additional friction.

## 🚀 Tech Stack

- **React 18** + **TypeScript** - Modern, type-safe UI development
- **Tailwind CSS** - Utility-first styling with custom animations
- **Chrome Extensions API** - Native browser integration and local storage
- **Radix UI** - Accessible, unstyled component primitives
- **Lucide React** - Beautiful, consistent icon system
- **Webpack** - Module bundling optimized for Chrome extensions

## 📁 Project Structure

```
src/
├── components/
│   ├── home/              # Landing page components
│   │   ├── SnusTracker.tsx      # Habit-breaking tool with psychology
│   │   └── QuickAccess.tsx      # Customizable quick links
│   ├── productivity/      # Focus and habit management
│   │   ├── HabitTracker.tsx     # Daily habits with streaks
│   │   ├── FocusTimer.tsx       # Pomodoro timer system
│   │   └── WeeklyOverview.tsx   # Analytics and heatmaps
│   ├── personal/          # Wellness and self-reflection
│   │   ├── WeeklyReflection.tsx # Advanced mood tracking
│   │   ├── MoodSlider.tsx       # iPhone-style mood input
│   │   ├── JourneyHeatmap.tsx   # Activity visualization
│   │   └── AchievementWall.tsx  # Gamification system
│   └── ui/               # Reusable UI components
├── views/                # Main application views
│   ├── HomeView.tsx           # Time display and quick access
│   ├── ProductivityView.tsx   # Habits and focus tracking
│   └── PersonalView.tsx       # Mood and reflection tools
├── lib/                  # Utilities and Chrome integration
│   └── chrome-storage.ts      # Storage abstraction layer
└── styles/               # Global styles and animations
```

## 🛠️ Development

### Prerequisites
- **Node.js** (v18 or higher)
- **Bun** (recommended) or npm/yarn
- **Chrome Browser** for testing

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd new-tab-extension
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or npm install
   ```

3. **Start development server**
   ```bash
   bun run dev
   # or npm run dev
   ```

4. **Build for production**
   ```bash
   bun run build
   # or npm run build
   ```

## 📦 Chrome Extension Installation

### Development Installation
1. Run `bun run build` to create the `dist` folder
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **"Developer mode"** in the top right
4. Click **"Load unpacked"** and select the `dist` folder
5. The extension will replace your new tab page immediately!

### Production Build
The build process creates an optimized bundle in the `dist` directory with:
- Minified React components
- Optimized CSS with Tailwind
- Chrome extension manifest
- Asset optimization

## 🎨 Customization

### Adding New Habits
```typescript
// Edit src/components/productivity/HabitTracker.tsx
const DEFAULT_HABITS: Habit[] = [
  { id: 'custom', name: 'Your Custom Habit', completed: false, iconName: 'Circle' },
  // ... existing habits
];
```

### Customizing Quick Links
```typescript
// Edit src/components/home/QuickAccess.tsx
const quickLinks = [
  { name: 'Your Tool', url: 'https://example.com', color: 'bg-gradient-to-br from-blue-500 to-cyan-500', icon: YourIcon },
  // ... existing links
];
```

### Styling Modifications
- **Colors**: Edit `tailwind.config.js` for theme customization
- **Animations**: Modify animation classes in Tailwind configuration
- **Layout**: Adjust grid layouts in view components

## 📊 Data Architecture

### Storage Strategy
- **Chrome Storage API** - Persistent data across browser sessions
- **localStorage fallback** - Development environment support
- **Unified data format** - Consistent data structure across components

### Key Data Structures
```typescript
// Daily activity logs
interface DailyLog {
  date: string;
  habitsCompleted: number;
  focusSessions: number;
  snusCount: number;
  moodData?: MoodEntry;
}

// Mood tracking
interface DailyReflection {
  date: string;
  mood: number; // 0-6 scale
  feelingTags: string[];
  contextTags: string[];
  note?: string;
}
```

## 🧪 Advanced Features

### Psychological Behavior Modification
The extension uses evidence-based techniques:
- **Shame-based motivation** for breaking negative habits
- **Streak mechanics** for building positive habits
- **Visual progress tracking** for sustained motivation
- **Reflective practices** for emotional awareness

### Data Visualization
- **Color-coded mood tracking** with emotional spectrum visualization
- **Heatmap analytics** showing productivity patterns over time
- **Progress indicators** with achievement unlocking system
- **Trend analysis** for long-term pattern recognition

## 🎯 Usage Philosophy

This extension is designed for individuals who want to:
- **Quantify personal development** through comprehensive tracking
- **Build consistent daily routines** with minimal friction
- **Develop emotional intelligence** through mood awareness
- **Break negative habits** using psychological techniques
- **Maintain focus** during work sessions
- **Visualize progress** over time for motivation

## 🔧 Technical Features

- **Automatic daily resets** - Handles day transitions intelligently
- **Cross-component data sharing** - Unified storage architecture
- **Responsive design** - Works on all screen sizes
- **Type safety** - Full TypeScript coverage
- **Performance optimized** - Lazy loading and efficient rendering
- **Accessibility** - ARIA-compliant components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling
- **Lucide React** for beautiful icons
- **Chrome Extensions API** for browser integration

---

Transform your browsing experience into a personal development journey. Every new tab becomes an opportunity for growth, reflection, and progress tracking. 🚀 