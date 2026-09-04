import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, SendHorizontal, Clock, QrCode, Bell, User, LogOut, Hexagon, X, Menu } from 'lucide-react'

export default function Layout() {
  const { user, logout, isDemo } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [unread, setUnread] = useState(0)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    api.get('/api/notifications/unread-count')
      .then((res) => setUnread(res.data.data?.count ?? 0))
      .catch(() => {})
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Bottom navigation items (mobile) — 5 tabs like UPI apps
  const bottomTabs = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/send', icon: SendHorizontal, label: 'Pay' },
    { to: '/qr', icon: QrCode, label: 'Scan' },
    { to: '/history', icon: Clock, label: 'History' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* === TOP NAV — Desktop only === */}
      <nav className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-orb-800 rounded-xl flex items-center justify-center">
              <Hexagon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">Orb</span>
            {isDemo && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">Demo</span>}
          </NavLink>

          {/* Desktop links */}
          <div className="flex items-center gap-1">
            {[
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/send', label: 'Send & Request' },
              { to: '/history', label: 'Activity' },
              { to: '/qr', label: 'Scan' },
            ].map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-orb-50 text-orb-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <NavLink to="/notifications" className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">{unread > 9 ? '9+' : unread}</span>
              )}
            </NavLink>

            <div className="relative">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-orb-100 text-orb-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {(user?.fullName || user?.username || 'U')[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden lg:block">{user?.fullName || user?.username}</span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.fullName || user?.username}</p>
                      <p className="text-xs text-gray-500">@{user?.username}</p>
                    </div>
                    <NavLink to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4" /> Profile Settings
                    </NavLink>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* === MOBILE TOP BAR === */}
      <div className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-50 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orb-800 rounded-xl flex items-center justify-center">
              <Hexagon className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold text-gray-900">Orb</span>
            {isDemo && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">DEMO</span>}
          </NavLink>

          <div className="flex items-center gap-1">
            <NavLink to="/notifications" className="relative p-2.5 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">{unread > 9 ? '9+' : unread}</span>
              )}
            </NavLink>
          </div>
        </div>
      </div>

      {/* Click-away overlay for profile dropdown */}
      {showProfileMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-24 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* === BOTTOM TAB BAR — Mobile only (UPI style) === */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {bottomTabs.map(tab => {
            const Icon = tab.icon
            const isActive = location.pathname === tab.to
            // Special styling for the central "Scan" button
            const isCenter = tab.to === '/qr'

            if (isCenter) {
              return (
                <NavLink key={tab.to} to={tab.to} className="flex flex-col items-center -mt-5">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                    isActive ? 'bg-orb-800 text-white' : 'bg-orb-600 text-white'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-orb-800' : 'text-gray-400'}`}>{tab.label}</span>
                </NavLink>
              )
            }

            return (
              <NavLink key={tab.to} to={tab.to} className="flex flex-col items-center py-1 min-w-[56px]">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-orb-800' : 'text-gray-400'}`} />
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-orb-800' : 'text-gray-400'}`}>{tab.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
