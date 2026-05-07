import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'type' | 'usage' | 'danger' | 'success'
  className?: string
}

const variants = {
  default: 'bg-gray-700 text-gray-200',
  type: 'bg-gray-600 text-gray-100',
  usage: 'bg-blue-600/30 text-blue-300',
  danger: 'bg-red-600/30 text-red-300',
  success: 'bg-green-600/30 text-green-300',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
