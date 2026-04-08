import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-white/5 h-14 flex items-center px-4">
      <Link to="/dashboard" className="flex items-center gap-2 font-black text-lg text-white">
        <MapPin size={20} className="text-blue-500" />
        GastroMap
      </Link>
    </header>
  )
}
