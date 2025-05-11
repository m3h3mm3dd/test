"use client"

import { FC } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { TypingTitle } from '@/components/ui/TypingTitle'

interface RoleWelcomeProps {
  name: string
  role: string
}

export const RoleWelcome: FC<RoleWelcomeProps> = ({ name }) => {
  return (
    <GlassPanel className="p-6">
      <TypingTitle>
        Welcome back, {name} 👋
      </TypingTitle>
    </GlassPanel>
  )
}