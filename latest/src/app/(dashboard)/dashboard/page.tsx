"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCards } from '@/components/dashboard/StatCards';
import { Avatar } from '@/components/ui/avatar';
import { Bell, Settings, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/api/UserAPI';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

// TopBar with Welcome message and dynamic user data
function TopBar() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  
  useEffect(() => {
    async function fetchUser() {
      try {
        // Fetch the current user from the backend
        const user = await getCurrentUser();
        setUserData(user);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, []);
  
  // Dynamic gradient based on theme
  const getGradient = () => {
    switch(theme) {
      case 'neonPulse': return 'from-blue-400 via-purple-400 to-blue-500';
      case 'technoAurora': return 'from-indigo-400 via-blue-500 to-indigo-600';
      case 'lushForest': return 'from-green-400 to-emerald-600';
      case 'sundownSerenity': return 'from-orange-300 to-pink-400';
      default: return 'from-primary via-indigo-500 to-primary';
    }
  };
  
  return (
    <div className="flex items-center justify-between py-6 px-2">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {loading ? (
          <div className="h-8 w-64 bg-white/5 animate-pulse rounded-lg"></div>
        ) : (
          <h1 className={cn(
            "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
            getGradient()
          )}>
            Welcome back, {userData?.FirstName || 'User'}
          </h1>
        )}
      </motion.div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            2
          </span>
        </Button>
        
        <div className="relative">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="relative overflow-hidden rounded-full">
              <Avatar 
                size="sm" 
                name={loading ? '?' : (userData?.FirstName || 'User')}
              />
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              dropdownOpen && "rotate-180"
            )} />
          </div>
          
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden z-50"
              >
                <div className="p-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      size="md" 
                      name={loading ? '?' : (userData?.FirstName || 'User')}
                    />
                    <div>
                      <p className="font-medium">{loading ? 'Loading...' : `${userData?.FirstName || ''} ${userData?.LastName || ''}`}</p>
                      <p className="text-xs text-muted-foreground truncate">{userData?.Email || 'user@example.com'}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      router.push('/profile');
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2.5 text-sm hover:bg-white/10"
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      router.push('/settings');
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2.5 text-sm hover:bg-white/10"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Footer Quote component
function QuoteFooter() {
  const quotes = [
    {
      text: "Show me your calendar and I'll show you your priorities.",
      author: "Cal Newport"
    },
    {
      text: "You become what you consistently do.",
      author: "James Clear"
    },
    {
      text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
      author: "Stephen Covey"
    }
  ];
  
  // Choose a random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="py-3 px-4 text-center text-sm text-muted-foreground/70 border-t border-white/5 mt-6"
    >
      "{randomQuote.text}" <span className="opacity-70">— {randomQuote.author}</span>
    </motion.div>
  );
}

// Main Dashboard
export default function DashboardRedesign() {
  return (
    <div className="min-h-full pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <TopBar />
        
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <StatCards />
          </motion.div>
          
          {/* Project Highlights */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute -top-28 -right-28 w-56 h-56 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-background/50 to-transparent pointer-events-none"></div>
            
            <h2 className="text-xl font-semibold mb-4">
              Project Highlights
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Empty state with styling */}
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center mb-4">
                  <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md text-center">Create your first project to see highlights, trends and progress</p>
                <Button className="bg-gradient-to-r from-primary to-indigo-600 shadow-lg shadow-primary/20">
                  Create Project
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Activity Timeline */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Recent Activity
              </h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            
            {/* Empty state timeline */}
            <div className="relative pl-6 border-l border-white/10 py-2">
              <div className="absolute left-0 top-3 h-3 w-3 rounded-full bg-primary/30 ring-4 ring-primary/10"></div>
              <p className="text-sm text-muted-foreground">Your activity will appear here</p>
            </div>
          </motion.div>
        </motion.div>
        
        <QuoteFooter />
      </div>
    </div>
  );
}