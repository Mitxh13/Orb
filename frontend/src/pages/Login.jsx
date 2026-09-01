import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Hexagon } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // DEMO MODE BYPASS
    if (username === 'bemd18' && password === 'bemd@18') {
      const demoUser = { id: 'demo-123', username: 'bemd18', email: 'bemd@demo.com', fullName: 'Mitesh Demo' }
      setAuth(demoUser, 'demo-access-token', 'demo-refresh-token', true)
      toast.success('Welcome to Demo Mode!')
      navigate('/dashboard')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { username, password })
      const { accessToken, refreshToken, user } = res.data.data
      setAuth(user, accessToken, refreshToken, false)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-orb-600 p-3 rounded-2xl">
            <Hexagon className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Sign in to Orb</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">Manage your money, effortlessly.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orb-500 focus:border-transparent transition-all placeholder-gray-400"
              placeholder="Username or Email"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orb-500 focus:border-transparent transition-all placeholder-gray-400"
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-orb-600 text-white rounded-xl font-semibold hover:bg-orb-700 disabled:opacity-50 transition-colors shadow-md shadow-orb-600/30"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-orb-600 font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
