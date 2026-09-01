import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.put('/api/users/me', { fullName })
      setUser(res.data.data)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Profile</h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
          <p className="text-sm font-medium text-gray-800">@{user?.username}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
        <form onSubmit={handleUpdate} className="space-y-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orb-500"
              placeholder="Your full name" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-orb-600 text-white rounded-lg font-medium hover:bg-orb-700 disabled:opacity-50 transition-colors">
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
