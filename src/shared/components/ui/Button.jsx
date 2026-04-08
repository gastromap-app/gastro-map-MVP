import { forwardRef } from 'react'

const variants = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/10',
  ghost:     'hover:bg-white/10 text-white/70 hover:text-white',
  danger:    'bg-red-600 hover:bg-red-700 text-white',
}
const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5', lg: 'px-6 py-3 text-lg' }

const Button = forwardRef(({ children, variant = 'primary', size = 'md', className = '', loading, disabled, ...props }, ref) => (
  <button ref={ref} disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}>
    {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}
  </button>
))
Button.displayName = 'Button'
export default Button
