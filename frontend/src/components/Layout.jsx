import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Menu, X, Hexagon, LogOut } from 'lucide-react'

export default function Layout() {
  const { user, logout, isDemo } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [unread, setUnread] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    api.get('/api/notifications/unread-count')
      .then((res) => setUnread(res.data.data.count))
      .catch(() => {})
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/send', label: 'Send & Request' },
    { to: '/history', label: 'Activity' },
    { to: '/qr', label: 'Scan' },
    { to: '/profile', label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-orb-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <NavLink to="/dashboard" className="flex items-center gap-2 mr-8">
              <Hexagon className="w-8 h-8 text-white fill-white/20" />
              <span className="text-2xl font-bold tracking-tight hidden sm:block">Orb</span>
              {isDemo && <span className="ml-2 text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Demo</span>}
            </NavLink>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-1 flex-1">
              {navItems.map((item) => (
                <NavLink 
                  key={item.to} 
                  to={item.to}
                  className={({ isActive }) => 
                    `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isActive ? 'bg-orb-900 text-white' : 'text-orb-100 hover:bg-orb-700/50 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              <NavLink to="/notifications" className="relative p-2 rounded-full hover:bg-orb-700/50 transition-colors">
                <Bell className="w-5 h-5 text-orb-100" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-orb-800"></span>
                )}
              </NavLink>
              
              <div className="hidden md:flex items-center gap-3 pl-4 border-l border-orb-700">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold">{user?.fullName || user?.username}</span>
                  <span className="text-xs text-orb-200">@{user?.username}</span>
                </div>
                <button onClick={handleLogout} className="p-2 rounded-full hover:bg-orb-700/50 transition-colors" title="Log out">
                  <LogOut className="w-5 h-5 text-orb-200 hover:text-white" />
                </button>
              </div>

              <button className="md:hidden p-2 text-orb-100 hover:text-white" onClick={() => setMobileOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-white z-50 md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900">{user?.fullName || user?.username}</span>
                  <span className="text-xs text-gray-500">@{user?.username}</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink 
                    key={item.to} 
                    to={item.to} 
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => 
                      `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? 'bg-orb-50 text-orb-700' : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100">
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content with Route Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
