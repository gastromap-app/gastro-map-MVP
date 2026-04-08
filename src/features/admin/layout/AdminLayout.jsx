import { NavLink, Outlet } from 'react-router-dom'
import { BarChart2, MapPin, Users, Shield, Inbox, ToggleLeft, Heart, Settings, Brain, Bot, CreditCard } from 'lucide-react'

const NAV = [
  { to: '/admin',              icon: BarChart2,   label: 'Dashboard' },
  { to: '/admin/locations',    icon: MapPin,      label: 'Locations' },
  { to: '/admin/users',        icon: Users,       label: 'Users' },
  { to: '/admin/moderation',   icon: Shield,      label: 'Moderation' },
  { to: '/admin/submissions',  icon: Inbox,       label: 'Submissions' },
  { to: '/admin/donations',    icon: Heart,       label: 'Donations' },
  { to: '/admin/subscriptions',icon: CreditCard,  label: 'Subscriptions' },
  { to: '/admin/feature-flags',icon: ToggleLeft,  label: 'Feature Flags' },
  { to: '/admin/ai',           icon: Bot,         label: 'AI Config' },
  { to: '/admin/knowledge',    icon: Brain,       label: 'Knowledge' },
  { to: '/admin/settings',     icon: Settings,    label: 'Settings' },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="w-56 flex-shrink-0 border-r border-white/5 flex flex-col">
        <div className="h-14 flex items-center px-5 border-b border-white/5 font-black text-sm text-blue-400">⚙️ Admin</div>
        <nav className="flex-1 py-4 space-y-0.5 px-3 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
