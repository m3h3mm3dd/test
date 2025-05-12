'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, User, LogOut, Settings as SettingsIcon, Palette, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dropdown } from '@/components/ui/dropdown'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { getCurrentUser } from '@/api/UserAPI'
import { toast } from '@/lib/toast'

const extendedThemes = {
  neonPulse: {
    name: "Neon Pulse",
    primary: "#0EF0FF",
    background: "#0A0E1A",
    foreground: "#FFFFFF",
    muted: "#101428",
    description: "Futuristic, vibrant, high-energy",
    gradient: "from-blue-500 via-purple-500 to-pink-500"
  },
  sundownSerenity: {
    name: "Sundown Serenity",
    primary: "#FFA27B",
    background: "#FEF3E2",
    foreground: "#484340",
    muted: "#F5E1CE",
    description: "Calm, relaxed, nature-inspired",
    gradient: "from-orange-300 via-pink-300 to-purple-300"
  },
  midnightSlate: {
    name: "Midnight Slate",
    primary: "#6B7CFF",
    background: "#1F2937",
    foreground: "#F3F4F6",
    muted: "#2A3644",
    description: "Elegant, professional, sleek",
    gradient: "from-gray-700 via-gray-800 to-gray-900"
  },
  lushForest: {
    name: "Lush Forest",
    primary: "#3EB875",
    background: "#F1F9F5",
    foreground: "#1B3A29",
    muted: "#DCE8E0",
    description: "Earthy, calming, organic",
    gradient: "from-green-700 via-green-600 to-green-500"
  },
  technoAurora: {
    name: "Techno Aurora",
    primary: "#4D4DFF",
    background: "#080825",
    foreground: "#E2E8F0",
    muted: "#10104B",
    description: "Cosmic, otherworldly, high-tech",
    gradient: "from-blue-800 via-indigo-700 to-purple-800"
  },
  blue: {
    name: "Classic Blue",
    primary: "#3B82F6",
    background: "#F9FAFB",
    foreground: "#111827",
    muted: "#E5E7EB",
    description: "Clean, professional, classic",
    gradient: "from-blue-400 to-blue-600"
  },
};

export function Topbar() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isThemeOpen, setIsThemeOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notificationsCount, setNotificationsCount] = useState(2)
  const themeDropdownRef = useRef<HTMLDivElement>(null)

  // Ensure we have a valid currentTheme by defaulting to 'blue' if not found
  const currentTheme = (theme && extendedThemes[theme as keyof typeof extendedThemes]) 
    ? theme as keyof typeof extendedThemes 
    : 'blue'
  
  // Animation variants for theme dropdown
  const dropdownVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        duration: 0.4, 
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  }

  // Close theme dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Failed to load user:', error)
        // Set a dummy user in case API fails
        setUser({ name: 'User', FirstName: 'User' })
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('taskup_token')
    router.push('/login')
    toast.success('Logged out successfully')
  }

  const profileMenuItems = [
    {
      label: 'Profile',
      icon: User,
      onClick: () => router.push('/profile'),
    },
    {
      label: 'Settings',
      icon: SettingsIcon,
      onClick: () => router.push('/settings'),
    },
    {
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
    },
  ]

  // Standalone theme switcher component
  const renderThemeSwitcher = () => (
    <div className="relative z-40" ref={themeDropdownRef}>
      <motion.button
        onClick={() => setIsThemeOpen(!isThemeOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-sm"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={cn(
          "h-4 w-4 rounded-full",
          `bg-gradient-to-r ${extendedThemes[currentTheme]?.gradient || extendedThemes.blue.gradient}`
        )} />
        <Palette className="h-4 w-4 text-muted-foreground" />
        <span>Theme</span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isThemeOpen && "rotate-180"
          )} 
        />
      </motion.button>

      <AnimatePresence>
        {isThemeOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-72 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-lg z-50"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h3 className="text-sm font-medium mb-2 px-2">Select a theme</h3>
            <div className="space-y-1">
              {Object.entries(extendedThemes).map(([key, value]) => (
                <motion.button
                  key={key}
                  variants={itemVariants}
                  onClick={() => {
                    setTheme(key as any);
                    setIsThemeOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    theme === key 
                      ? "bg-white/10 text-white"
                      : "hover:bg-white/5 text-muted-foreground hover:text-white"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <div className={cn(
                      "h-8 w-8 rounded-full shadow-inner",
                      `bg-gradient-to-r ${value.gradient}`
                    )} />
                    {theme === key && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{value.name}</div>
                    <div className="text-xs opacity-70">{value.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md px-4 shadow-sm transition-all">
      <div className="flex items-center gap-6">
        {/* TaskUp title only */}
        <div className="text-xl font-bold text-primary">TaskUp</div>

        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium"
          >
            <div className="flex items-center gap-1.5">
              <span>Welcome,</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
              >
                {user?.FirstName || user?.name || 'User'}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                👋
              </motion.span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Always render the right side with theme switcher */}
      <div className="flex items-center gap-3">
        {/* Theme Switcher */}
        {renderThemeSwitcher()}
        
        {/* Show notifications and profile only when user is loaded */}
        {!loading && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {notificationsCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                  variant="destructive"
                >
                  {notificationsCount}
                </Badge>
              )}
            </Button>

            <Dropdown
              trigger={
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar
                    src={user?.ProfileUrl || user?.avatarUrl}
                    name={user?.FirstName || user?.name || 'User'}
                    size="sm"
                  />
                </Button>
              }
              items={profileMenuItems}
              align="end"
            />
          </>
        )}
      </div>
    </header>
  )
}