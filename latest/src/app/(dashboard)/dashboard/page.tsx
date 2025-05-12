'use client';

import { motion } from 'framer-motion';
import { StatCards } from '@/components/dashboard/StatCards';
import { CreateFAB } from '@/components/dashboard/CreateFAB';
import { DailyQuote } from '@/components/dashboard/DailyQuote';
import { FocusSection } from '@/components/dashboard/FocusSection';

export default function DashboardPage() {
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

  return (
    <motion.div
      className="space-y-6 pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <StatCards />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
            <FocusSection />
          </motion.div>
          <motion.div variants={itemVariants}>
            <DailyQuote />
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Tips</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">
                  Use the quick-add feature to capture tasks as they come to mind
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">
                  You can snooze non-urgent tasks to focus on priorities
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">
                  Review your completed tasks to celebrate progress
                </span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      <CreateFAB />
    </motion.div>
  );
}
