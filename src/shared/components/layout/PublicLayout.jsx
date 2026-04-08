import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* TODO: PublicNavbar */}
      <Outlet />
      {/* TODO: PublicFooter with /donate link */}
    </div>
  )
}
