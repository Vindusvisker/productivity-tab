import { 
  // Novice Icons (1-4)
  BeakerIcon,
  AcademicCapIcon,
  BookOpenIcon,
  LightBulbIcon,
  
  // Apprentice Icons (5-9)
  WrenchIcon,
  CogIcon,
  BoltIcon,
  FireIcon,
  
  // Warrior Icons (10-14)
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CommandLineIcon,
  RocketLaunchIcon,
  
  // Champion Icons (15-19)
  TrophyIcon,
  StarIcon,
  SparklesIcon,
  SunIcon,
  
  // Master Icons (20-29)
  KeyIcon,
  HomeModernIcon,
  GlobeAltIcon,
  EyeIcon,
  
  // Legend Icons (30-39)
  ArrowPathIcon,
  MegaphoneIcon,
  VariableIcon,
  CubeTransparentIcon,
  
  // Mythic Icons (40-49)
  PuzzlePieceIcon,
  CircleStackIcon,
  CpuChipIcon,
  CloudIcon,
  
  // Godlike Icons (50+)
  HandRaisedIcon,
  HeartIcon,
  FaceSmileIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid'
import { Crown } from 'lucide-react'

interface HeroIconProps {
  level: number
  className?: string
}

export default function HeroIcon({ level, className = "h-6 w-6" }: HeroIconProps) {
  const getIconForLevel = (level: number) => {
    // Novice Tier (1-4) - Learning & Discovery
    if (level === 1) return <BeakerIcon className={className} />
    if (level === 2) return <AcademicCapIcon className={className} />
    if (level === 3) return <BookOpenIcon className={className} />
    if (level === 4) return <LightBulbIcon className={className} />
    
    // Apprentice Tier (5-9) - Building & Creating
    if (level === 5) return <WrenchIcon className={className} />
    if (level === 6) return <CogIcon className={className} />
    if (level === 7) return <BoltIcon className={className} />
    if (level === 8) return <FireIcon className={className} />
    if (level === 9) return <RocketLaunchIcon className={className} />
    
    // Warrior Tier (10-14) - Strength & Protection
    if (level === 10) return <ShieldCheckIcon className={className} />
    if (level === 11) return <ShieldExclamationIcon className={className} />
    if (level === 12) return <CommandLineIcon className={className} />
    if (level === 13) return <SunIcon className={className} />
    if (level === 14) return <SparklesIcon className={className} />
    
    // Champion Tier (15-19) - Excellence & Victory
    if (level === 15) return <TrophyIcon className={className} />
    if (level === 16) return <StarIcon className={className} />
    if (level === 17) return <HomeModernIcon className={className} />
    if (level === 18) return <KeyIcon className={className} />
    if (level === 19) return <GlobeAltIcon className={className} />
    
    // Master Tier (20-29) - Wisdom & Leadership
    if (level >= 20 && level <= 24) return <EyeIcon className={className} />
    if (level >= 25 && level <= 29) return <ArrowPathIcon className={className} />
    
    // Legend Tier (30-39) - Transcendence
    if (level >= 30 && level <= 34) return <MegaphoneIcon className={className} />
    if (level >= 35 && level <= 39) return <VariableIcon className={className} />
    
    // Mythic Tier (40-49) - Beyond Mortal
    if (level >= 40 && level <= 44) return <CubeTransparentIcon className={className} />
    if (level >= 45 && level <= 49) return <PuzzlePieceIcon className={className} />
    
    // Godlike Tier (50+) - Ultimate Power
    if (level >= 50 && level <= 69) return <CircleStackIcon className={className} />
    if (level >= 70 && level <= 89) return <CpuChipIcon className={className} />
    if (level >= 90 && level <= 99) return <CloudIcon className={className} />
    
    // Transcendent (100+) - Ultimate Achievement
    if (level >= 100) return <Crown className={className} />
    
    // Fallback for any missed levels
    return <HandRaisedIcon className={className} />
  }

  const getTierInfo = (level: number) => {
    if (level <= 4) return { tier: 'Novice', color: 'text-gray-300' }
    if (level <= 9) return { tier: 'Apprentice', color: 'text-blue-400' }
    if (level <= 14) return { tier: 'Warrior', color: 'text-green-400' }
    if (level <= 19) return { tier: 'Champion', color: 'text-yellow-400' }
    if (level <= 29) return { tier: 'Master', color: 'text-orange-400' }
    if (level <= 39) return { tier: 'Legend', color: 'text-red-400' }
    if (level <= 49) return { tier: 'Mythic', color: 'text-purple-400' }
    if (level <= 99) return { tier: 'Godlike', color: 'text-pink-400' }
    return { tier: 'Transcendent', color: 'text-white' }
  }

  const tierInfo = getTierInfo(level)

  return (
    <div className="flex items-center justify-center relative">
      <div className={tierInfo.color}>
        {getIconForLevel(level)}
      </div>
    </div>
  )
}

// Export the tier info function for use in other components
export function getLevelTierInfo(level: number) {
  if (level <= 4) return { tier: 'Novice', color: 'text-gray-300', bgColor: 'from-gray-400 to-gray-600' }
  if (level <= 9) return { tier: 'Apprentice', color: 'text-blue-400', bgColor: 'from-blue-400 to-blue-600' }
  if (level <= 14) return { tier: 'Warrior', color: 'text-green-400', bgColor: 'from-green-400 to-green-600' }
  if (level <= 19) return { tier: 'Champion', color: 'text-yellow-400', bgColor: 'from-yellow-400 to-orange-600' }
  if (level <= 29) return { tier: 'Master', color: 'text-orange-400', bgColor: 'from-orange-400 to-red-600' }
  if (level <= 39) return { tier: 'Legend', color: 'text-red-400', bgColor: 'from-red-400 to-red-600' }
  if (level <= 49) return { tier: 'Mythic', color: 'text-purple-400', bgColor: 'from-purple-400 to-purple-600' }
  if (level <= 99) return { tier: 'Godlike', color: 'text-pink-400', bgColor: 'from-pink-400 to-pink-600' }
  return { tier: 'Transcendent', color: 'text-yellow-300', bgColor: 'from-yellow-400 via-yellow-500 to-yellow-600' }
} 

