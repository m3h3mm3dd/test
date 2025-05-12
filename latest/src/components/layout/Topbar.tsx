'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell, User, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dropdown } from '@/components/ui/Dropdown'
import { getCurrentUser } from '@/api/user'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'

export function Topbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notificationsCount, setNotificationsCount] = useState(2)

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Failed to load user:', error)
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
      onClick: () => router.push('/profile')
    },
    { 
      label: 'Settings', 
      icon: SettingsIcon, 
      onClick: () => router.push('/settings')
    },
    { 
      label: 'Logout', 
      icon: LogOut, 
      onClick: handleLogout
    }
  ]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md px-4 shadow-sm transition-all">
      <div className="flex items-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg font-medium ml-16 sm:ml-20"
        >
          {!loading && user && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span>Welcome,</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                >
                  {user.FirstName || user.name}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  👋
                </motion.span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      <div className="flex items-center gap-2">
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
      </div>
    </header>
  )
}