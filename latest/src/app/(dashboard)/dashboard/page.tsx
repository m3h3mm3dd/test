'use client';

import { HeroPanel } from '@/components/dashboard/HeroPanel';
import { CreateFAB } from '@/components/dashboard/CreateFAB';
import { DailyQuote } from '@/components/dashboard/DailyQuote';
import { StatCards } from '@/components/dashboard/StatCards';
import { FocusSection } from '@/components/dashboard/FocusSection';

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-20">
      {/* Top Greeting */}
      <HeroPanel />

      {/* Live Stats */}
      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Focus + Quote */}
        <div className="lg:col-span-2 space-y-6">
          <FocusSection />
          <DailyQuote />
        </div>

        {/* Right: Quick Tips */}
        <div className="space-y-6">
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
        </div>
      </div>

      {/* Floating Button */}
      <CreateFAB />
    </div>
  );
}
