import { NavLink } from 'react-router-dom'
import { Home, Search, Bot, Heart, User, Plus } from 'lucide-react'
import { useFeatureFlags } from '@/shared/store/feature-flags.store'

const navItems = [
  { to: '/dashboard',  icon: Home,   label: 'Home' },
  { to: '/explore',    icon: Search, label: 'Explore' },
  { to: '/ai-guide',   icon: Bot,    label: 'AI Guide' },
  { to: '/saved',      icon: Heart,  label: 'Saved' },
  { to: '/profile',    icon: User,   label: 'Profile' },
]

export default function BottomNav() {
  const { isEnabled } = useFeatureFlags()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-slate-900/95 backdrop-blur border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around px-2 h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                isActive ? 'text-blue-500' : 'text-white/50 hover:text-white'}`}>
            <Icon size={22} />
            <span className="text-[10px] font-semibold">{label}</span>
          </NavLink>
        ))}

        {/* Community Submissions — hidden when flag is off */}
        {isEnabled('community_submissions') && (
          <NavLink to="/add-place"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                isActive ? 'text-blue-500' : 'text-white/50 hover:text-white'}`}>
            <Plus size={22} />
            <span className="text-[10px] font-semibold">Add</span>
          </NavLink>
        )}
      </div>
    </nav>
  )
}
