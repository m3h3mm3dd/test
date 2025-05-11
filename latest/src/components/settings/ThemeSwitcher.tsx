'use client'

import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

const themes = [
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'Ocean', value: 'ocean' },
  { name: 'Solar', value: 'solar' },
  { name: 'Midnight', value: 'midnight' },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium border transition-colors',
            theme === t.value
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-transparent hover:bg-muted'
          )}
        >
          {t.name}
        </button>
      ))}
    </div>
  )
}
