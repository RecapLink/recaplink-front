import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-[#4d9538] text-white rounded-[30px] font-bold hover:bg-[#3d7a2e] active:scale-95 shadow-sm',
  secondary: 'border-2 border-[#4d9538] text-[#4d9538] rounded-[8px] bg-transparent hover:bg-[#ebf5ea]',
  danger: 'border-2 border-[#c41539] text-[#c41539] rounded-[30px] bg-transparent hover:bg-red-50',
  ghost: 'bg-transparent text-[#231F20] hover:bg-gray-100 rounded-[8px]',
  outline: 'border border-gray-300 text-[#231F20] rounded-[8px] bg-white hover:bg-gray-50',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-4 text-sm',
  md: 'h-[50px] px-6 text-base',
  lg: 'h-[60px] px-8 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : children}
    </button>
  ),
)
Button.displayName = 'Button'
