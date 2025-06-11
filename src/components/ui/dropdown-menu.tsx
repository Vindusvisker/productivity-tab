"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | undefined>(undefined)

const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error("useDropdownMenu must be used within a DropdownMenu")
  }
  return context
}

const DropdownMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={ref} className={cn("relative inline-block text-left", className)} {...props}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
})
DropdownMenu.displayName = "DropdownMenu"

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  const { isOpen, setIsOpen } = useDropdownMenu()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(!isOpen)
    onClick?.(event)
  }

  return (
    <button
      ref={ref}
      className={cn("inline-flex items-center justify-center", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onClose?: () => void
  }
>(({ className, children, onClose, ...props }, ref) => {
  const { isOpen, setIsOpen } = useDropdownMenu()
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute right-0 z-[9999] min-w-[8rem] overflow-hidden rounded-xl border bg-black/90 backdrop-blur-xl border-white/20 p-1 text-white shadow-xl",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={{ transform: 'translateZ(0)' }}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, onClick, ...props }, ref) => {
  const { setIsOpen } = useDropdownMenu()

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event)
    setIsOpen(false) // Close menu after clicking an item
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-white/10 focus:bg-white/10",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} 