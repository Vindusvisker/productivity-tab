'use client'

import React from 'react'

interface ClaimButtonProps {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
  variant?: 'golden' | 'blue' | 'purple' | 'green'
}

export const ClaimButton: React.FC<ClaimButtonProps> = ({ 
  onClick, 
  disabled, 
  children, 
  variant = 'golden' 
}) => {
  const getVariantClasses = () => {
    if (disabled) {
      return 'bg-gray-600/50 border-gray-500/30 text-gray-400 cursor-not-allowed shadow-none'
    }
    
    switch (variant) {
      case 'green':
        return 'bg-green-600 border-green-400/30 text-white hover:border-green-400/60 hover:scale-105 shadow-xl shadow-green-500/20'
      case 'purple':
        return 'bg-purple-600 border-purple-400/30 text-white hover:border-purple-400/60 hover:scale-105 shadow-xl shadow-purple-500/20'
      case 'blue':
        return 'bg-blue-600 border-blue-400/30 text-white hover:border-blue-400/60 hover:scale-105 shadow-xl shadow-blue-500/20'
      default: // golden
        return 'bg-yellow-600 border-yellow-400/30 text-white hover:border-yellow-400/60 hover:scale-105 shadow-xl shadow-yellow-500/20'
    }
  }

  const getBackgroundGradient = () => {
    if (disabled) return undefined
    
    switch (variant) {
      case 'green':
        return 'linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74))'
      case 'purple':
        return 'linear-gradient(135deg, rgb(147 51 234), rgb(126 34 206))'
      case 'blue':
        return 'linear-gradient(135deg, rgb(37 99 235), rgb(29 78 216))'
      default: // golden
        return 'linear-gradient(135deg, rgb(245 158 11), rgb(217 119 6), rgb(180 83 9))'
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        transition-all duration-300 ease-in-out
        py-2 px-5 rounded-full
        flex items-center justify-center gap-2.5
        font-bold text-sm border-2
        ${getVariantClasses()}
        ${!disabled ? 'group' : ''}
      `}
      style={{
        background: getBackgroundGradient()
      }}
    >
      {/* Shine effect */}
      {!disabled && (
        <div className="absolute top-0 -left-[100px] w-[100px] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-60 group-hover:animate-shine-sweep transition-all duration-1500 ease-out" />
      )}
      {children}
    </button>
  )
} 