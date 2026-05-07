import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white data-[state=open]:bg-blue-500',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100 data-[state=open]:bg-gray-600',
  ghost: 'hover:bg-gray-800 text-gray-300 hover:text-white data-[state=open]:bg-gray-800',
  danger: 'bg-red-700 hover:bg-red-600 text-white data-[state=open]:bg-red-600',
}

const sizes = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', asChild = false, className = '', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'
