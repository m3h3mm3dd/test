'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeroPanel() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleLogout = () => {
    localStorage.removeItem('taskup_token');
    router.push('/login');
  };

  const username = 'User'; // Replace this with real user later

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-sm"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            <span>Welcome back, </span>
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              {username}
            </span>
            <span className="ml-1">👋</span>
          </h1>
          <p className="text-muted-foreground">
            {currentDate} • You're currently managing projects and tasks with TaskUp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              onClick={() => setShowDropdown((prev) => !prev)}
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Avatar size="md" name={username} />
            </Button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  key="dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-lg z-10"
                >
                  <div className="py-1">
                    <button
                      onClick={() => router.push('/profile')}
                      className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Your Profile
                    </button>
                    <button
                      onClick={() => router.push('/settings')}
                      className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                    <hr className="my-1 border-white/10" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            onClick={() => router.push('/settings')}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
