export interface UserConfig {
  // Addiction tracking
  hasAddiction: boolean
  addictionType: 'snus' | 'tobacco' | 'alcohol' | 'gambling' | 'other'
  addictionName: string
  costPerUnit: number
  unitsPerPackage: number
  packageCost: number

  // Financial
  hourlyRate: number
  currency: 'NOK' | 'USD' | 'EUR' | 'SEK'
  monthlyContribution: number
  contributionDay: number

  // Personal
  firstName: string
  motivation: string

  // System
  onboardingCompleted: boolean
} 