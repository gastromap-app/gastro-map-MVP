export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white/10 text-white/80',
    blue:    'bg-blue-600/20 text-blue-400',
    green:   'bg-emerald-600/20 text-emerald-400',
    amber:   'bg-amber-600/20 text-amber-400',
    violet:  'bg-violet-600/20 text-violet-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
