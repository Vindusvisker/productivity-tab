export interface UserConfig {
  // Addiction tracking
  hasAddiction: boolean
  addictionType: 'snus' | 'tobacco' | 'alcohol' | 'gambling' | 'other'
  addictionName: string
  costPerUnit: number
  unitsPerPackage: number
  packageCost: number
  dailyLimit: number // Daily usage limit
  previousMonthlyConsumption: number // How many packages they used to consume per month

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