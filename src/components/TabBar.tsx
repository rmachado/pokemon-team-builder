import * as Tabs from '@radix-ui/react-tabs'
import { Pencil, BarChart3, Users } from 'lucide-react'
import type { GameTab } from '../types'

interface TabItem {
  id: GameTab
  label: string
  icon: React.ReactNode
}

interface TabBarProps {
  active: GameTab
  onChange: (tab: GameTab) => void
}

const tabs: TabItem[] = [
  { id: 'builder', label: 'Builder', icon: <Pencil className="w-3.5 h-3.5" /> },
  { id: 'analysis', label: 'Analysis', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: 'teams', label: 'Teams', icon: <Users className="w-3.5 h-3.5" /> },
]

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <Tabs.Root value={active} onValueChange={v => onChange(v as GameTab)}>
      <Tabs.List className="flex border-b border-gray-700" aria-label="Navigation">
        {tabs.map(tab => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="flex-1 py-2.5 text-sm font-medium transition-colors relative data-[state=active]:text-blue-400 text-gray-500 hover:text-gray-300 data-[state=active]:cursor-default cursor-pointer outline-none"
          >
            <span className="flex items-center justify-center gap-1.5">
              {tab.icon}
              {tab.label}
            </span>
            <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-500 rounded-full data-[state=inactive]:opacity-0 transition-opacity" data-state={active === tab.id ? 'active' : 'inactive'} />
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}
