import { forwardRef, type ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
  asChild?: boolean
}

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100',
  ghost: 'hover:bg-gray-800 text-gray-400 hover:text-gray-200',
  danger: 'bg-red-700 hover:bg-red-600 text-white',
}

const sizes = {
  sm: 'px-2.5 py-1 text-xs rounded-lg',
  md: 'px-3 py-1.5 text-sm rounded-lg',
  lg: 'px-4 py-2 text-base rounded-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, onClick, variant = 'primary', size = 'md', asChild = false, disabled, className = '', type = 'button' }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref as never}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-1.5 font-medium transition-colors active-scale disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'
